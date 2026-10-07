"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { attractionFormSchema, type AttractionFormInput } from "@/lib/validation/attractions";
import {
  createAttraction,
  updateAttraction,
  deleteAttraction,
  setAttractionStatus,
  setAttractionFeatured,
  moveAttraction,
  type MutationResult,
} from "@/lib/data/admin/attractions";
import { setProductAttraction, moveProductInAttraction } from "@/lib/data/admin/products";
import type { AttractionStatus } from "@/lib/types";

/**
 * Every mutation below revalidates the exact public routes that read the
 * `attractions` table (per src/lib/data/attractions.ts): the /experiences
 * index (now the attraction grid), the attraction's own detail/listing
 * page, the homepage (if it ever surfaces featured attractions), plus the
 * admin list itself. Mirrors revalidateCategoryRoutes() in
 * src/app/admin/(protected)/categories/actions.ts exactly.
 */
function revalidateAttractionRoutes(slug?: string, previousSlug?: string) {
  revalidatePath("/experiences");
  revalidatePath("/admin/experiences");
  revalidatePath("/");
  if (slug) revalidatePath(`/experiences/attraction/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/experiences/attraction/${previousSlug}`);
}

export async function createAttractionAction(input: AttractionFormInput): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const parsed = attractionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const result = await createAttraction(parsed.data);
  if (result.success) {
    revalidateAttractionRoutes(parsed.data.slug);
    await logAudit({
      actorUserId: staff.userId,
      action: "attraction.create",
      entityType: "attraction",
      entityId: result.id,
      after: parsed.data,
    });
  }
  return result;
}

export async function updateAttractionAction(
  id: string,
  input: AttractionFormInput,
  previousSlug?: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const parsed = attractionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const result = await updateAttraction(id, parsed.data);
  if (result.success) {
    revalidateAttractionRoutes(parsed.data.slug, previousSlug);
    await logAudit({
      actorUserId: staff.userId,
      action: "attraction.update",
      entityType: "attraction",
      entityId: id,
      after: parsed.data,
    });
  }
  return result;
}

export async function deleteAttractionAction(id: string, slug?: string): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const result = await deleteAttraction(id);
  if (result.success) {
    revalidateAttractionRoutes(slug);
    await logAudit({
      actorUserId: staff.userId,
      action: "attraction.delete",
      entityType: "attraction",
      entityId: id,
      before: { slug },
    });
  }
  return result;
}

export async function setAttractionStatusAction(
  id: string,
  status: AttractionStatus,
  slug?: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const result = await setAttractionStatus(id, status);
  if (result.success) {
    revalidateAttractionRoutes(slug);
    await logAudit({
      actorUserId: staff.userId,
      action: "attraction.status_change",
      entityType: "attraction",
      entityId: id,
      after: { status },
    });
  }
  return result;
}

export async function setAttractionFeaturedAction(
  id: string,
  featured: boolean,
  slug?: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const result = await setAttractionFeatured(id, featured);
  if (result.success) {
    revalidateAttractionRoutes(slug);
    await logAudit({
      actorUserId: staff.userId,
      action: "attraction.featured_change",
      entityType: "attraction",
      entityId: id,
      after: { featured },
    });
  }
  return result;
}

export async function moveAttractionAction(id: string, direction: "up" | "down"): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const result = await moveAttraction(id, direction);
  if (result.success) {
    revalidateAttractionRoutes();
    await logAudit({
      actorUserId: staff.userId,
      action: "attraction.reorder",
      entityType: "attraction",
      entityId: id,
      after: { direction },
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tickets & Experiences panel (inside the Attraction Editor) — assigning,
// removing and reordering which products belong to this attraction.
// Revalidates both sides of the relationship: the attraction's own public
// page (ticket list changes) and the product's public page (its
// "belongs to this attraction" breadcrumb/related-tickets changes), plus
// both admin screens.
// ---------------------------------------------------------------------------

function revalidateAssignmentRoutes(attractionId: string, attractionSlug?: string, productSlug?: string) {
  revalidatePath("/experiences");
  revalidatePath("/admin/experiences");
  revalidatePath("/admin/experiences/tickets");
  revalidatePath(`/admin/experiences/attractions/${attractionId}`);
  if (attractionSlug) revalidatePath(`/experiences/attraction/${attractionSlug}`);
  if (productSlug) revalidatePath(`/experiences/${productSlug}`);
}

export async function assignProductToAttractionAction(
  productId: string,
  attractionId: string,
  attractionSlug: string,
  productSlug: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const result = await setProductAttraction(productId, attractionId);
  if (result.success) {
    revalidateAssignmentRoutes(attractionId, attractionSlug, productSlug);
    await logAudit({
      actorUserId: staff.userId,
      action: "product.attraction_assign",
      entityType: "product",
      entityId: productId,
      after: { attractionId },
    });
  }
  return result;
}

export async function removeProductFromAttractionAction(
  productId: string,
  attractionId: string,
  attractionSlug: string,
  productSlug: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const result = await setProductAttraction(productId, null);
  if (result.success) {
    revalidateAssignmentRoutes(attractionId, attractionSlug, productSlug);
    await logAudit({
      actorUserId: staff.userId,
      action: "product.attraction_remove",
      entityType: "product",
      entityId: productId,
      before: { attractionId },
    });
  }
  return result;
}

export async function moveProductInAttractionAction(
  productId: string,
  direction: "up" | "down",
  attractionId: string,
  attractionSlug: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/experiences");
  const result = await moveProductInAttraction(productId, direction);
  if (result.success) {
    revalidateAssignmentRoutes(attractionId, attractionSlug);
    await logAudit({
      actorUserId: staff.userId,
      action: "product.attraction_reorder",
      entityType: "product",
      entityId: productId,
      after: { direction },
    });
  }
  return result;
}
