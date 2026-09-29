"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSupplier } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { productFormSchema, type ProductFormInput } from "@/lib/validation/products";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  generateAvailability,
  updateAvailabilityCapacity,
  deleteAvailabilityDate,
  getAdminProductAvailability,
  type MutationResult,
} from "@/lib/data/admin/products";
import { getProductOwnerSupplierId } from "@/lib/data/supplier/experiences";
import type { AvailabilityRow } from "@/app/admin/(protected)/experiences/actions";

/**
 * Every mutation below is the supplier-scoped mirror of
 * src/app/admin/(protected)/experiences/actions.ts, reusing the SAME
 * ownership-agnostic data-layer functions (src/lib/data/admin/products.ts)
 * but adding two things the admin actions don't need: (1) an explicit
 * ownership check before ever touching a product id supplied by the
 * client, and (2) a hard server-side override of `status` — a supplier's
 * submitted status is NEVER trusted, regardless of what the form/editor
 * sent, because the client-side "Status" field is meant to be hidden for
 * suppliers (see ExperienceEditor's lockStatusField) but that's UX, not
 * enforcement. Only "draft" and "pending_review" are ever reachable from
 * here; a supplier can never set live/paused/rejected/changes_requested,
 * which stay admin-only (src/app/admin/(protected)/experiences/approvals).
 */

function revalidateSupplierExperienceRoutes(id?: string) {
  revalidatePath("/supplier/experiences");
  revalidatePath("/supplier/dashboard");
  revalidatePath("/admin/experiences/approvals");
  if (id) revalidatePath(`/supplier/experiences/${id}`);
}

async function assertOwnership(productId: string, supplierId: string): Promise<MutationResult | null> {
  const ownerId = await getProductOwnerSupplierId(productId);
  if (ownerId !== supplierId) {
    return { success: false, error: "You don't have access to this experience." };
  }
  return null;
}

async function stampSubmission(productId: string) {
  await db.update(products).set({ submittedAt: new Date() }).where(eq(products.id, productId));
}

export async function supplierCreateProductAction(input: ProductFormInput): Promise<MutationResult> {
  const supplier = await requireSupplier("/supplier/experiences/new");
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const safeStatus: "draft" | "pending_review" = parsed.data.status === "pending_review" ? "pending_review" : "draft";
  const payload = { ...parsed.data, supplierId: supplier.supplierId, status: safeStatus };
  const result = await createProduct(payload);

  if (result.success && result.id) {
    if (safeStatus === "pending_review") await stampSubmission(result.id);
    revalidateSupplierExperienceRoutes(result.id);
    await logAudit({
      actorUserId: supplier.userId,
      action: "supplier.experience_create",
      entityType: "product",
      entityId: result.id,
      after: { title: payload.title, status: safeStatus },
    });
  }
  return result;
}

export async function supplierUpdateProductAction(
  id: string,
  input: ProductFormInput,
  previousSlug?: string,
): Promise<MutationResult> {
  const supplier = await requireSupplier(`/supplier/experiences/${id}`);
  const ownershipError = await assertOwnership(id, supplier.supplierId);
  if (ownershipError) return ownershipError;

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const safeStatus: "draft" | "pending_review" = parsed.data.status === "pending_review" ? "pending_review" : "draft";
  const payload = { ...parsed.data, supplierId: supplier.supplierId, status: safeStatus };
  const result = await updateProduct(id, payload);

  if (result.success) {
    if (safeStatus === "pending_review") await stampSubmission(id);
    revalidateSupplierExperienceRoutes(id);
    await logAudit({
      actorUserId: supplier.userId,
      action: "supplier.experience_update",
      entityType: "product",
      entityId: id,
      after: { title: payload.title, status: safeStatus, previousSlug },
    });
  }
  return result;
}

export async function supplierDeleteProductAction(id: string, slug?: string): Promise<MutationResult> {
  const supplier = await requireSupplier("/supplier/experiences");
  const ownershipError = await assertOwnership(id, supplier.supplierId);
  if (ownershipError) return ownershipError;

  const result = await deleteProduct(id);
  if (result.success) {
    revalidateSupplierExperienceRoutes();
    await logAudit({
      actorUserId: supplier.userId,
      action: "supplier.experience_delete",
      entityType: "product",
      entityId: id,
      before: { slug },
    });
  }
  return result;
}

async function currentAvailabilityWindow(productId: string): Promise<AvailabilityRow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const far = new Date();
  far.setDate(far.getDate() + 400);
  return getAdminProductAvailability(productId, today, far.toISOString().slice(0, 10));
}

export async function supplierGenerateAvailabilityAction(
  productId: string,
  input: { days: number; capacityTotal: number },
): Promise<MutationResult & { availability?: AvailabilityRow[] }> {
  const supplier = await requireSupplier(`/supplier/experiences/${productId}`);
  const ownershipError = await assertOwnership(productId, supplier.supplierId);
  if (ownershipError) return ownershipError;

  const result = await generateAvailability(productId, input.days, input.capacityTotal);
  if (!result.success) return result;
  await logAudit({
    actorUserId: supplier.userId,
    action: "supplier.availability_generate",
    entityType: "product",
    entityId: productId,
    after: input,
  });
  return { ...result, availability: await currentAvailabilityWindow(productId) };
}

export async function supplierUpdateAvailabilityCapacityAction(
  productId: string,
  date: string,
  capacityTotal: number,
): Promise<MutationResult & { availability?: AvailabilityRow[] }> {
  const supplier = await requireSupplier(`/supplier/experiences/${productId}`);
  const ownershipError = await assertOwnership(productId, supplier.supplierId);
  if (ownershipError) return ownershipError;

  const result = await updateAvailabilityCapacity(productId, date, capacityTotal);
  if (!result.success) return result;
  await logAudit({
    actorUserId: supplier.userId,
    action: "supplier.availability_update",
    entityType: "product",
    entityId: productId,
    after: { date, capacityTotal },
  });
  return { ...result, availability: await currentAvailabilityWindow(productId) };
}

export async function supplierDeleteAvailabilityDateAction(
  productId: string,
  date: string,
): Promise<MutationResult & { availability?: AvailabilityRow[] }> {
  const supplier = await requireSupplier(`/supplier/experiences/${productId}`);
  const ownershipError = await assertOwnership(productId, supplier.supplierId);
  if (ownershipError) return ownershipError;

  const result = await deleteAvailabilityDate(productId, date);
  if (!result.success) return result;
  await logAudit({
    actorUserId: supplier.userId,
    action: "supplier.availability_delete",
    entityType: "product",
    entityId: productId,
    before: { date },
  });
  return { ...result, availability: await currentAvailabilityWindow(productId) };
}
