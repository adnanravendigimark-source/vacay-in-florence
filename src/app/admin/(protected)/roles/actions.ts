"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import {
  createRole,
  updateRole,
  deleteRole,
  assignUserRoleByEmail,
  removeStaffAccess,
  type MutationResult,
  type RoleEditInput,
} from "@/lib/data/admin/roles";

export async function createRoleAction(input: RoleEditInput): Promise<MutationResult> {
  const staff = await requirePermission("roles.manage", "/admin/roles");
  const result = await createRole(input);
  if (result.success) {
    revalidatePath("/admin/roles");
    await logAudit({ actorUserId: staff.userId, action: "role.create", entityType: "role", entityId: result.id, after: input });
  }
  return result;
}

export async function updateRoleAction(id: string, input: RoleEditInput): Promise<MutationResult> {
  const staff = await requirePermission("roles.manage", "/admin/roles");
  const result = await updateRole(id, input);
  if (result.success) {
    revalidatePath("/admin/roles");
    revalidatePath(`/admin/roles/${id}`);
    await logAudit({ actorUserId: staff.userId, action: "role.update", entityType: "role", entityId: id, after: input });
  }
  return result;
}

export async function deleteRoleAction(id: string): Promise<MutationResult> {
  const staff = await requirePermission("roles.manage", "/admin/roles");
  const result = await deleteRole(id);
  if (result.success) {
    revalidatePath("/admin/roles");
    await logAudit({ actorUserId: staff.userId, action: "role.delete", entityType: "role", entityId: id });
  }
  return result;
}

export async function assignUserRoleAction(email: string, roleId: string): Promise<MutationResult> {
  const staff = await requirePermission("roles.manage", "/admin/roles");
  const result = await assignUserRoleByEmail(email, roleId);
  if (result.success) {
    revalidatePath("/admin/roles");
    await logAudit({
      actorUserId: staff.userId,
      action: "user.role_assign",
      entityType: "user",
      entityId: result.id,
      after: { email, roleId },
    });
  }
  return result;
}

export async function removeStaffAccessAction(userId: string): Promise<MutationResult> {
  const staff = await requirePermission("roles.manage", "/admin/roles");
  const result = await removeStaffAccess(userId, staff.userId);
  if (result.success) {
    revalidatePath("/admin/roles");
    await logAudit({ actorUserId: staff.userId, action: "user.role_remove", entityType: "user", entityId: userId });
  }
  return result;
}
