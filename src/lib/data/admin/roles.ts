import "server-only";
import crypto from "node:crypto";
import { desc, eq, and, isNotNull, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getPgErrorCode } from "@/lib/db/errors";
import { roles, permissions, rolePermissions, users, verificationTokens } from "@/lib/db/schema";
import { sendStaffInviteEmail } from "@/lib/email";

const PASSWORD_SETUP_TTL_MS = 24 * 60 * 60 * 1000;

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface PermissionCatalogEntry {
  id: string;
  key: string;
  label: string;
  category: string;
}

export interface AdminRoleListItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionCount: number;
  memberCount: number;
}

export interface AdminRoleDetail {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionKeys: string[];
}

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  createdAt: Date;
}

/** The fixed catalog of possible permissions (permissions.key/label/category), seeded once. */
export async function listPermissionCatalog(): Promise<PermissionCatalogEntry[]> {
  const rows = await db.select().from(permissions).orderBy(permissions.category, permissions.label);
  return rows;
}

export async function listAdminRoles(): Promise<AdminRoleListItem[]> {
  const rows = await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      isSystem: roles.isSystem,
      permissionCount: sql<number>`(select count(*)::int from ${rolePermissions} where ${rolePermissions.roleId} = ${roles.id})`,
      memberCount: sql<number>`(select count(*)::int from ${users} where ${users.roleId} = ${roles.id})`,
    })
    .from(roles)
    .orderBy(desc(roles.isSystem), roles.name);
  return rows;
}

export async function getAdminRoleById(id: string): Promise<AdminRoleDetail | null> {
  const [role] = await db.select().from(roles).where(eq(roles.id, id));
  if (!role) return null;

  const permRows = await db
    .select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id));

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissionKeys: permRows.map((p) => p.key),
  };
}

export interface RoleEditInput {
  name: string;
  description: string | null;
  permissionKeys: string[];
}

async function replaceRolePermissions(roleId: string, permissionKeys: string[]) {
  const catalog = await db.select({ id: permissions.id, key: permissions.key }).from(permissions);
  const idByKey = new Map(catalog.map((p) => [p.key, p.id]));
  const permissionIds = permissionKeys.map((k) => idByKey.get(k)).filter((v): v is string => !!v);

  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (permissionIds.length > 0) {
      await tx.insert(rolePermissions).values(permissionIds.map((permissionId) => ({ roleId, permissionId })));
    }
  });
}

export async function createRole(input: RoleEditInput): Promise<MutationResult> {
  try {
    const [created] = await db
      .insert(roles)
      .values({ name: input.name, description: input.description, isSystem: false })
      .returning({ id: roles.id });
    await replaceRolePermissions(created.id, input.permissionKeys);
    return { success: true, id: created.id };
  } catch (err) {
    const code = getPgErrorCode(err);
    if (code === "23505") {
      return { success: false, error: "A role with this name already exists." };
    }
    console.error("[admin/roles] createRole failed:", err);
    return { success: false, error: "Could not create the role." };
  }
}

export async function updateRole(id: string, input: RoleEditInput): Promise<MutationResult> {
  try {
    const [role] = await db.select({ isSystem: roles.isSystem }).from(roles).where(eq(roles.id, id));
    if (!role) return { success: false, error: "Role not found." };
    // The Super Admin role's name/description are protected (it's the
    // undeletable role every install needs to always have access) but its
    // permission SET can still be edited — that's intentional per the
    // plan, so only the name write is skipped for system roles.
    if (!role.isSystem) {
      await db.update(roles).set({ name: input.name, description: input.description, updatedAt: new Date() }).where(eq(roles.id, id));
    } else {
      await db.update(roles).set({ description: input.description, updatedAt: new Date() }).where(eq(roles.id, id));
    }
    await replaceRolePermissions(id, input.permissionKeys);
    return { success: true, id };
  } catch (err) {
    const code = getPgErrorCode(err);
    if (code === "23505") {
      return { success: false, error: "A role with this name already exists." };
    }
    console.error("[admin/roles] updateRole failed:", err);
    return { success: false, error: "Could not save the role." };
  }
}

export async function deleteRole(id: string): Promise<MutationResult> {
  try {
    const [role] = await db.select({ isSystem: roles.isSystem }).from(roles).where(eq(roles.id, id));
    if (!role) return { success: false, error: "Role not found." };
    if (role.isSystem) {
      return { success: false, error: "The Super Admin role can't be deleted — the platform always needs at least one." };
    }
    await db.delete(roles).where(eq(roles.id, id));
    return { success: true };
  } catch (err) {
    const code = getPgErrorCode(err);
    if (code === "23503") {
      return {
        success: false,
        error: "Staff members still have this role assigned — move them to another role first.",
      };
    }
    console.error("[admin/roles] deleteRole failed:", err);
    return { success: false, error: "Could not delete the role." };
  }
}

export async function listStaffMembers(): Promise<AdminStaffMember[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(isNotNull(users.roleId))
    .orderBy(users.name);
  return rows as AdminStaffMember[];
}

/**
 * Grants admin/staff access by email. Staff accounts are now a fully
 * separate `accountType: "staff"` row from any customer or supplier
 * account on the same email (see the account-isolation overhaul in
 * claude/auth-email-verification-and-account-isolation-summary.md) — this
 * NEVER reuses or mutates an existing customer/supplier row, so granting
 * an admin's own personal email staff access can't affect their separate
 * customer account.
 *
 * - If a staff row already exists for this email (including a
 *   previously-revoked one, whose accountType stays "staff" forever with
 *   roleId cleared — see removeStaffAccess below), this just (re)points
 *   its roleId. No new email is sent; they already have credentials.
 * - Otherwise, this creates a brand-new staff account with a random,
 *   cryptographically unusable password (nobody knows it — the row
 *   exists so the invite can be emailed and so audit_logs has someone to
 *   attribute future actions to), emailVerified left null, and a
 *   password_setup token emailed via sendStaffInviteEmail. The invited
 *   person sets their real password (and proves mailbox ownership) by
 *   following that link to /reset-password.
 */
export async function assignUserRoleByEmail(email: string, name: string, roleId: string): Promise<MutationResult> {
  const normalized = email.trim().toLowerCase();
  const displayName = name.trim() || normalized;

  try {
    const [role] = await db.select({ name: roles.name }).from(roles).where(eq(roles.id, roleId));
    if (!role) return { success: false, error: "Role not found." };

    const [existingStaff] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, normalized), eq(users.accountType, "staff")));

    if (existingStaff) {
      await db.update(users).set({ roleId, updatedAt: new Date() }).where(eq(users.id, existingStaff.id));
      return { success: true, id: existingStaff.id };
    }

    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
    const [created] = await db
      .insert(users)
      .values({
        email: normalized,
        name: displayName,
        passwordHash,
        accountType: "staff",
        roleId,
        emailVerified: null,
      })
      .returning({ id: users.id });

    const token = crypto.randomUUID();
    await db.insert(verificationTokens).values({
      userId: created.id,
      token,
      type: "password_setup",
      expiresAt: new Date(Date.now() + PASSWORD_SETUP_TTL_MS),
    });
    await sendStaffInviteEmail(normalized, displayName, token, role.name);

    return { success: true, id: created.id };
  } catch (err) {
    const code = getPgErrorCode(err);
    if (code === "23505") {
      return { success: false, error: "That email already has a staff account." };
    }
    console.error("[admin/roles] assignUserRoleByEmail failed:", err);
    return { success: false, error: "Could not assign this role." };
  }
}

/**
 * Demotes a staff member back out of the admin panel (roleId -> null).
 * The row itself, its accountType ("staff"), and its email are kept
 * forever rather than deleted: audit_logs.actorUserId has no ON DELETE
 * rule, so deleting it would break the history of everything they ever
 * did, and keeping accountType "staff" reserves that (email, "staff")
 * slot so a later re-invite via assignUserRoleByEmail finds this same
 * row instead of colliding with it. authorizeAgainstRole's staff path
 * requires roleId IS NOT NULL, so a revoked row behaves exactly like "no
 * account" for login purposes.
 */
export async function removeStaffAccess(userId: string, actingUserId: string): Promise<MutationResult> {
  if (userId === actingUserId) {
    return { success: false, error: "You can't remove your own admin access." };
  }
  try {
    await db.update(users).set({ roleId: null, updatedAt: new Date() }).where(eq(users.id, userId));
    return { success: true, id: userId };
  } catch (err) {
    console.error("[admin/roles] removeStaffAccess failed:", err);
    return { success: false, error: "Could not remove admin access." };
  }
}
