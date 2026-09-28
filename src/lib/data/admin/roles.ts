import "server-only";
import { desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { roles, permissions, rolePermissions, users } from "@/lib/db/schema";

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
    const code = (err as { code?: string } | null)?.code;
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
    const code = (err as { code?: string } | null)?.code;
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
    const code = (err as { code?: string } | null)?.code;
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
 * Promotes an existing customer account to staff (or moves an existing
 * staff member to a different role) by email — there's no separate
 * "create user" flow here; every account starts as an ordinary
 * `/register` signup, and this just points its roleId at a role.
 */
export async function assignUserRoleByEmail(email: string, roleId: string): Promise<MutationResult> {
  try {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.trim().toLowerCase()));
    if (!user) return { success: false, error: "No account found with that email. They need to register first." };
    await db.update(users).set({ roleId, updatedAt: new Date() }).where(eq(users.id, user.id));
    return { success: true, id: user.id };
  } catch (err) {
    console.error("[admin/roles] assignUserRoleByEmail failed:", err);
    return { success: false, error: "Could not assign this role." };
  }
}

/** Demotes a staff member back to an ordinary customer (roleId -> null). */
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
