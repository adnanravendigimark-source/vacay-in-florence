"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { notifySupplier } from "@/lib/supplier-notifications";
import { recordSupplierPayout } from "@/lib/data/admin/supplier-payouts";
import {
  createSupplier,
  updateSupplier,
  setSupplierStatus,
  bulkSetSuppliersStatus,
  deleteSupplier,
  bulkDeleteSuppliers,
  approveSupplierApplication,
  rejectSupplierApplication,
  saveSupplierNote,
  type MutationResult,
  type SupplierStatus,
  type SupplierEditInput,
  type SupplierCreateInput,
} from "@/lib/data/admin/suppliers";

const STATUS_NOTIFICATIONS: Partial<
  Record<SupplierStatus, { type: "application_approved" | "application_rejected" | "admin_message"; title: string }>
> = {
  approved: { type: "application_approved", title: "Your supplier account was approved" },
  rejected: { type: "application_rejected", title: "Your supplier application was not approved" },
  suspended: { type: "admin_message", title: "Your supplier account was suspended" },
};

function revalidateSupplierRoutes() {
  revalidatePath("/admin/suppliers");
}

export async function createSupplierAction(input: SupplierCreateInput): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await createSupplier(input);
  if (result.success && result.id) {
    revalidateSupplierRoutes();
    await logAudit({
      actorUserId: staff.userId,
      action: "supplier.create",
      entityType: "supplier",
      entityId: result.id,
      after: input,
    });
  }
  return result;
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
    const notification = STATUS_NOTIFICATIONS[status];
    if (notification) {
      await notifySupplier({ supplierId: id, type: notification.type, title: notification.title });
    }
  }
  return result;
}

export async function saveSupplierNoteAction(id: string, note: string): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await saveSupplierNote(id, note);
  if (result.success) {
    revalidateSupplierRoutes();
    revalidatePath(`/admin/suppliers/${id}`);
    await logAudit({ actorUserId: staff.userId, action: "supplier.note_update", entityType: "supplier", entityId: id, after: { notes: note } });
  }
  return result;
}

export async function bulkSetSuppliersStatusAction(ids: string[], status: SupplierStatus): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await bulkSetSuppliersStatus(ids, status);
  if (result.success) {
    revalidateSupplierRoutes();
    await logAudit({
      actorUserId: staff.userId,
      action: "supplier.bulk_status_change",
      entityType: "supplier",
      entityId: ids.join(","),
      after: { ids, status },
    });
  }
  return result;
}

export async function deleteSupplierAction(id: string): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await deleteSupplier(id);
  if (result.success) {
    revalidateSupplierRoutes();
    await logAudit({ actorUserId: staff.userId, action: "supplier.delete", entityType: "supplier", entityId: id });
  }
  return result;
}

export async function bulkDeleteSuppliersAction(ids: string[]): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await bulkDeleteSuppliers(ids);
  if (result.success) {
    revalidateSupplierRoutes();
    await logAudit({ actorUserId: staff.userId, action: "supplier.bulk_delete", entityType: "supplier", entityId: ids.join(",") });
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
    if (result.id) {
      await notifySupplier({
        supplierId: result.id,
        type: "application_approved",
        title: "Your supplier account was approved",
      });
    }
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

export async function recordSupplierPayoutAction(
  supplierId: string,
  amount: number,
  notes: string,
): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  const result = await recordSupplierPayout(supplierId, amount, notes.trim() || null);
  if (result.success) {
    revalidatePath(`/admin/suppliers/${supplierId}`);
    revalidatePath("/supplier/financials");
    await logAudit({
      actorUserId: staff.userId,
      action: "supplier.payout_record",
      entityType: "supplier",
      entityId: supplierId,
      after: { amount, payoutId: result.id },
    });
    await notifySupplier({
      supplierId,
      type: "payout_recorded",
      title: "A payout was recorded",
      body: `€${amount.toFixed(2)} marked as paid.`,
      entityType: "supplier_payout",
      entityId: result.id,
    });
  }
  return result;
}

export async function sendSupplierMessageAction(
  supplierId: string,
  subject: string,
  message: string,
): Promise<MutationResult> {
  const staff = await requirePermission("suppliers.manage", "/admin/suppliers");
  if (!subject.trim() || !message.trim()) {
    return { success: false, error: "Subject and message are required." };
  }

  try {
    await notifySupplier({
      supplierId,
      type: "admin_message",
      title: subject.trim(),
      body: message.trim(),
      entityType: "admin_message",
      entityId: staff.userId,
    });

    await logAudit({
      actorUserId: staff.userId,
      action: "supplier.message_sent",
      entityType: "supplier",
      entityId: supplierId,
      after: { subject: subject.trim(), message: message.trim() },
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to dispatch message";
    return { success: false, error: errorMsg };
  }
}
