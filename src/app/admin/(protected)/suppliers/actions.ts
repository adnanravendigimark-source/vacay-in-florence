"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import {
  updateSupplier,
  setSupplierStatus,
  approveSupplierApplication,
  rejectSupplierApplication,
  type MutationResult,
  type SupplierStatus,
  type SupplierEditInput,
} from "@/lib/data/admin/suppliers";

function revalidateSupplierRoutes() {
  revalidatePath("/admin/suppliers");
}

export async function updateSupplierAction(id: string, input: SupplierEditInput): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await updateSupplier(id, input);
  if (result.success) {
    revalidateSupplierRoutes();
    revalidatePath(`/admin/suppliers/${id}`);
    await logAudit({ actorUserId: staff.userId, action: "supplier.update", entityType: "supplier", entityId: id, after: input });
  }
  return result;
}

export async function setSupplierStatusAction(id: string, status: SupplierStatus): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await setSupplierStatus(id, status);
  if (result.success) {
    revalidateSupplierRoutes();
    revalidatePath(`/admin/suppliers/${id}`);
    await logAudit({ actorUserId: staff.userId, action: "supplier.status_change", entityType: "supplier", entityId: id, after: { status } });
  }
  return result;
}

export async function approveSupplierApplicationAction(leadId: string): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await approveSupplierApplication(leadId);
  if (result.success) {
    revalidateSupplierRoutes();
    await logAudit({
      actorUserId: staff.userId,
      action: "supplier.application_approve",
      entityType: "supplier",
      entityId: result.id ?? leadId,
      after: { leadId },
    });
  }
  return result;
}

export async function rejectSupplierApplicationAction(leadId: string, reason: string): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await rejectSupplierApplication(leadId, reason);
  if (result.success) {
    revalidateSupplierRoutes();
    await logAudit({
      actorUserId: staff.userId,
      action: "supplier.application_reject",
      entityType: "lead_submission",
      entityId: leadId,
      after: { reason },
    });
  }
  return result;
}
