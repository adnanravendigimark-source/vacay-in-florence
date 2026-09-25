"use server";

import { revalidatePath } from "next/cache";
import { getStaffContext } from "@/lib/require-user";
import { productFormSchema, availabilityGenerateSchema, type ProductFormInput } from "@/lib/validation/products";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  setProductStatus,
  setProductFeatured,
  bulkSetProductStatus,
  bulkSetProductFeatured,
  bulkDeleteProducts,
  generateAvailability,
  updateAvailabilityCapacity,
  deleteAvailabilityDate,
  getAdminProductAvailability,
  type ProductStatus,
  type MutationResult,
  type BulkDeleteResult,
} from "@/lib/data/admin/products";

/**
 * Every mutation below revalidates the exact public routes that read the
 * `products` table (per src/lib/data/products.ts): the catalog list, the
 * product's own detail page, its category page, and the homepage (which
 * can surface featured experiences) — plus the admin list itself. This
 * is what makes "admin change -> same data on the public page" true
 * immediately rather than after the next deploy/ISR window.
 */
function revalidateExperienceRoutes(slug?: string, previousSlug?: string) {
  revalidatePath("/experiences");
  revalidatePath("/admin/experiences");
  revalidatePath("/");
  if (slug) revalidatePath(`/experiences/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/experiences/${previousSlug}`);
}

export async function createProductAction(input: ProductFormInput): Promise<MutationResult> {
  await getStaffContext();
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const result = await createProduct(parsed.data);
  if (result.success) revalidateExperienceRoutes(parsed.data.slug);
  return result;
}

export async function updateProductAction(
  id: string,
  input: ProductFormInput,
  previousSlug?: string,
): Promise<MutationResult> {
  await getStaffContext();
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const result = await updateProduct(id, parsed.data);
  if (result.success) revalidateExperienceRoutes(parsed.data.slug, previousSlug);
  return result;
}

export async function deleteProductAction(id: string, slug?: string): Promise<MutationResult> {
  await getStaffContext();
  const result = await deleteProduct(id);
  if (result.success) revalidateExperienceRoutes(slug);
  return result;
}

export async function setProductStatusAction(
  id: string,
  status: ProductStatus,
  slug?: string,
): Promise<MutationResult> {
  await getStaffContext();
  const result = await setProductStatus(id, status);
  if (result.success) revalidateExperienceRoutes(slug);
  return result;
}

export async function setProductFeaturedAction(
  id: string,
  featured: boolean,
  slug?: string,
): Promise<MutationResult> {
  await getStaffContext();
  const result = await setProductFeatured(id, featured);
  if (result.success) revalidateExperienceRoutes(slug);
  return result;
}

// ---------------------------------------------------------------------------
// Bulk actions — the list view's multi-select bar. Each takes the
// selected rows' {id, slug} pairs (not bare ids) so every affected
// public product page gets revalidated too, same as the single-item
// actions above.
// ---------------------------------------------------------------------------

export interface BulkTarget {
  id: string;
  slug: string;
}

function revalidateBulk(targets: BulkTarget[]) {
  revalidatePath("/experiences");
  revalidatePath("/admin/experiences");
  revalidatePath("/");
  for (const t of targets) revalidatePath(`/experiences/${t.slug}`);
}

export async function bulkSetProductStatusAction(targets: BulkTarget[], status: ProductStatus): Promise<MutationResult> {
  await getStaffContext();
  const result = await bulkSetProductStatus(targets.map((t) => t.id), status);
  if (result.success) revalidateBulk(targets);
  return result;
}

export async function bulkSetProductFeaturedAction(targets: BulkTarget[], featured: boolean): Promise<MutationResult> {
  await getStaffContext();
  const result = await bulkSetProductFeatured(targets.map((t) => t.id), featured);
  if (result.success) revalidateBulk(targets);
  return result;
}

export async function bulkDeleteProductsAction(targets: BulkTarget[]): Promise<BulkDeleteResult> {
  await getStaffContext();
  const result = await bulkDeleteProducts(targets.map((t) => t.id));
  revalidateBulk(targets);
  return result;
}

export interface AvailabilityRow {
  date: string;
  capacityTotal: number;
  capacityBooked: number;
}

async function currentAvailabilityWindow(productId: string): Promise<AvailabilityRow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const far = new Date();
  far.setDate(far.getDate() + 400);
  return getAdminProductAvailability(productId, today, far.toISOString().slice(0, 10));
}

export async function generateAvailabilityAction(
  productId: string,
  input: { days: number; capacityTotal: number },
): Promise<MutationResult & { availability?: AvailabilityRow[] }> {
  await getStaffContext();
  const parsed = availabilityGenerateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const result = await generateAvailability(productId, parsed.data.days, parsed.data.capacityTotal);
  if (!result.success) return result;
  revalidatePath(`/admin/experiences/${productId}`);
  return { ...result, availability: await currentAvailabilityWindow(productId) };
}

export async function updateAvailabilityCapacityAction(
  productId: string,
  date: string,
  capacityTotal: number,
): Promise<MutationResult & { availability?: AvailabilityRow[] }> {
  await getStaffContext();
  const result = await updateAvailabilityCapacity(productId, date, capacityTotal);
  if (!result.success) return result;
  return { ...result, availability: await currentAvailabilityWindow(productId) };
}

export async function deleteAvailabilityDateAction(
  productId: string,
  date: string,
): Promise<MutationResult & { availability?: AvailabilityRow[] }> {
  await getStaffContext();
  const result = await deleteAvailabilityDate(productId, date);
  if (!result.success) return result;
  return { ...result, availability: await currentAvailabilityWindow(productId) };
}
