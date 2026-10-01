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
  revalidatePath("/admin/attractions");
  revalidatePath("/");
  if (slug) revalidatePath(`/experiences/attraction/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/experiences/attraction/${previousSlug}`);
}

export async function createAttractionAction(input: AttractionFormInput): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/attractions");
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
  const staff = await requirePermission("catalog.manage", "/admin/attractions");
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
  const staff = await requirePermission("catalog.manage", "/admin/attractions");
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
  const staff = await requirePermission("catalog.manage", "/admin/attractions");
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
  const staff = await requirePermission("catalog.manage", "/admin/attractions");
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
  const staff = await requirePermission("catalog.manage", "/admin/attractions");
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
