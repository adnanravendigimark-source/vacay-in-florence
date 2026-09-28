"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import {
  updateAffiliate,
  setAffiliateStatus,
  approveAffiliateApplication,
  rejectAffiliateApplication,
  type MutationResult,
  type AffiliateStatus,
  type AffiliateEditInput,
} from "@/lib/data/admin/affiliates";

function revalidateAffiliateRoutes() {
  revalidatePath("/admin/affiliates");
}

export async function updateAffiliateAction(id: string, input: AffiliateEditInput): Promise<MutationResult> {
  const staff = await requirePermission("affiliates.manage", "/admin/affiliates");
  const result = await updateAffiliate(id, input);
  if (result.success) {
    revalidateAffiliateRoutes();
    revalidatePath(`/admin/affiliates/${id}`);
    await logAudit({ actorUserId: staff.userId, action: "affiliate.update", entityType: "affiliate", entityId: id, after: input });
  }
  return result;
}

export async function setAffiliateStatusAction(id: string, status: AffiliateStatus): Promise<MutationResult> {
  const staff = await requirePermission("affiliates.manage", "/admin/affiliates");
  const result = await setAffiliateStatus(id, status);
  if (result.success) {
    revalidateAffiliateRoutes();
    revalidatePath(`/admin/affiliates/${id}`);
    await logAudit({ actorUserId: staff.userId, action: "affiliate.status_change", entityType: "affiliate", entityId: id, after: { status } });
  }
  return result;
}

export async function approveAffiliateApplicationAction(leadId: string): Promise<MutationResult> {
  const staff = await requirePermission("affiliates.manage", "/admin/affiliates");
  const result = await approveAffiliateApplication(leadId);
  if (result.success) {
    revalidateAffiliateRoutes();
    await logAudit({
      actorUserId: staff.userId,
      action: "affiliate.application_approve",
      entityType: "affiliate",
      entityId: result.id ?? leadId,
      after: { leadId },
    });
  }
  return result;
}

export async function rejectAffiliateApplicationAction(leadId: string, reason: string): Promise<MutationResult> {
  const staff = await requirePermission("affiliates.manage", "/admin/affiliates");
  const result = await rejectAffiliateApplication(leadId, reason);
  if (result.success) {
    revalidateAffiliateRoutes();
    await logAudit({
      actorUserId: staff.userId,
      action: "affiliate.application_reject",
      entityType: "lead_submission",
      entityId: leadId,
      after: { reason },
    });
  }
  return result;
}
