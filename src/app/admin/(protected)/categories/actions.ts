"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validation/categories";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryStatus,
  setCategoryFeatured,
  moveCategory,
  type MutationResult,
} from "@/lib/data/admin/categories";
import type { CategoryStatus } from "@/lib/types";

/**
 * Every mutation below revalidates the exact public routes that read the
 * `categories` table (per src/lib/data/categories.ts): the categories
 * index, the category's own detail page (and experience listing filtered
 * by it), the homepage (quick-category-ribbon reads featured categories),
 * and the /experiences catalog (its filter pills read the full category
 * list) — plus the admin list itself.
 */
function revalidateCategoryRoutes(slug?: string, previousSlug?: string) {
  revalidatePath("/categories");
  revalidatePath("/experiences");
  revalidatePath("/admin/categories");
  revalidatePath("/");
  if (slug) revalidatePath(`/experiences/category/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/experiences/category/${previousSlug}`);
}

export async function createCategoryAction(input: CategoryFormInput): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/categories");
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const result = await createCategory(parsed.data);
  if (result.success) {
    revalidateCategoryRoutes(parsed.data.slug);
    await logAudit({ actorUserId: staff.userId, action: "category.create", entityType: "category", entityId: result.id, after: parsed.data });
  }
  return result;
}

export async function updateCategoryAction(
  id: string,
  input: CategoryFormInput,
  previousSlug?: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/categories");
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const result = await updateCategory(id, parsed.data);
  if (result.success) {
    revalidateCategoryRoutes(parsed.data.slug, previousSlug);
    await logAudit({ actorUserId: staff.userId, action: "category.update", entityType: "category", entityId: id, after: parsed.data });
  }
  return result;
}

export async function deleteCategoryAction(id: string, slug?: string): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/categories");
  const result = await deleteCategory(id);
  if (result.success) {
    revalidateCategoryRoutes(slug);
    await logAudit({ actorUserId: staff.userId, action: "category.delete", entityType: "category", entityId: id, before: { slug } });
  }
  return result;
}

export async function setCategoryStatusAction(
  id: string,
  status: CategoryStatus,
  slug?: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/categories");
  const result = await setCategoryStatus(id, status);
  if (result.success) {
    revalidateCategoryRoutes(slug);
    await logAudit({ actorUserId: staff.userId, action: "category.status_change", entityType: "category", entityId: id, after: { status } });
  }
  return result;
}

export async function setCategoryFeaturedAction(
  id: string,
  featured: boolean,
  slug?: string,
): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/categories");
  const result = await setCategoryFeatured(id, featured);
  if (result.success) {
    revalidateCategoryRoutes(slug);
    await logAudit({ actorUserId: staff.userId, action: "category.featured_change", entityType: "category", entityId: id, after: { featured } });
  }
  return result;
}

export async function moveCategoryAction(id: string, direction: "up" | "down"): Promise<MutationResult> {
  const staff = await requirePermission("catalog.manage", "/admin/categories");
  const result = await moveCategory(id, direction);
  if (result.success) {
    revalidateCategoryRoutes();
    await logAudit({ actorUserId: staff.userId, action: "category.reorder", entityType: "category", entityId: id, after: { direction } });
  }
  return result;
}
