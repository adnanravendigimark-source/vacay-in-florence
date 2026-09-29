"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { notifySupplier } from "@/lib/supplier-notifications";
import { reviewProduct, getAdminProductById, type MutationResult } from "@/lib/data/admin/products";

function revalidateApprovalRoutes(slug?: string) {
  revalidatePath("/admin/experiences/approvals");
  revalidatePath("/admin/experiences");
  revalidatePath("/supplier/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
  if (slug) revalidatePath(`/experiences/${slug}`);
}

async function loadForReview(id: string) {
  const product = await getAdminProductById(id);
  if (!product) return null;
  return product;
}

export async function approveExperienceAction(id: string): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences/approvals");
  const product = await loadForReview(id);
  if (!product) return { success: false, error: "Experience not found." };

  const result = await reviewProduct(id, "live", null);
  if (result.success) {
    revalidateApprovalRoutes(product.slug);
    await logAudit({
      actorUserId: staff.userId,
      action: "product.approve",
      entityType: "product",
      entityId: id,
      after: { status: "live" },
    });
    await notifySupplier({
      supplierId: product.supplierId,
      type: "experience_approved",
      title: `"${product.title}" was approved`,
      body: "Your experience is now live on the public site.",
      entityType: "product",
      entityId: id,
    });
  }
  return result;
}

export async function rejectExperienceAction(id: string, reviewNote: string): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences/approvals");
  const product = await loadForReview(id);
  if (!product) return { success: false, error: "Experience not found." };

  const result = await reviewProduct(id, "rejected", reviewNote);
  if (result.success) {
    revalidateApprovalRoutes(product.slug);
    await logAudit({
      actorUserId: staff.userId,
      action: "product.reject",
      entityType: "product",
      entityId: id,
      after: { status: "rejected", reviewNote },
    });
    await notifySupplier({
      supplierId: product.supplierId,
      type: "experience_rejected",
      title: `"${product.title}" was not approved`,
      body: reviewNote,
      entityType: "product",
      entityId: id,
    });
  }
  return result;
}

export async function requestExperienceChangesAction(id: string, reviewNote: string): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences/approvals");
  const product = await loadForReview(id);
  if (!product) return { success: false, error: "Experience not found." };

  const result = await reviewProduct(id, "changes_requested", reviewNote);
  if (result.success) {
    revalidateApprovalRoutes(product.slug);
    await logAudit({
      actorUserId: staff.userId,
      action: "product.request_changes",
      entityType: "product",
      entityId: id,
      after: { status: "changes_requested", reviewNote },
    });
    await notifySupplier({
      supplierId: product.supplierId,
      type: "experience_rejected",
      title: `Changes requested for "${product.title}"`,
      body: reviewNote,
      entityType: "product",
      entityId: id,
    });
  }
  return result;
}
