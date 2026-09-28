import "server-only";
import { eq, and, sql, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { ensureCategoriesSchemaUpToDate } from "@/lib/data/categories";
import type { CategoryFormData } from "@/lib/validation/categories";
import type { CategoryIcon, CategoryStatus } from "@/lib/types";

/**
 * Admin-scoped repository over `categories` — unlike src/lib/data/categories.ts
 * (the public repository, which only ever returns status="published" rows),
 * every function here can see and act on drafts too, since admin needs to
 * manage a category before it goes live.
 */

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface AdminCategoryListItem {
  id: string;
  slug: string;
  name: string;
  icon: CategoryIcon;
  imageUrl: string;
  imageAlt: string;
  status: CategoryStatus;
  featured: boolean;
  sortOrder: number;
  productCount: number;
}

export interface AdminCategoryDetail {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  icon: CategoryIcon;
  status: CategoryStatus;
  featured: boolean;
  sortOrder: number;
  highlights: string[];
  badgeText: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string;
  imageAlt: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
  productCount: number;
}

const withProductCount = () =>
  db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      shortDescription: categories.shortDescription,
      icon: categories.icon,
      imageUrl: categories.imageUrl,
      imageAlt: categories.imageAlt,
      heroImageUrl: categories.heroImageUrl,
      heroImageAlt: categories.heroImageAlt,
      status: categories.status,
      featured: categories.featured,
      sortOrder: categories.sortOrder,
      highlights: categories.highlights,
      badgeText: categories.badgeText,
      ctaLabel: categories.ctaLabel,
      ctaHref: categories.ctaHref,
      metaTitle: categories.metaTitle,
      metaDescription: categories.metaDescription,
      canonicalUrl: categories.canonicalUrl,
      ogImage: categories.ogImage,
      noIndex: categories.noIndex,
      noFollow: categories.noFollow,
      // ::int — Postgres count() is bigint, which node-postgres returns
      // as a string by default; cast so productCount stays a JS number.
      productCount: sql<number>`count(${products.id})::int`.as("productCount"),
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.status, "live")))
    .groupBy(categories.id);

export async function listAdminCategories(): Promise<AdminCategoryListItem[]> {
  await ensureCategoriesSchemaUpToDate();
  const rows = await withProductCount().orderBy(asc(categories.sortOrder));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon as CategoryIcon,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    status: row.status as CategoryStatus,
    featured: row.featured,
    sortOrder: row.sortOrder,
    productCount: row.productCount,
  }));
}

export async function getAdminCategoryById(id: string): Promise<AdminCategoryDetail | null> {
  await ensureCategoriesSchemaUpToDate();
  const [row] = await withProductCount().where(eq(categories.id, id));
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    icon: row.icon as CategoryIcon,
    status: row.status as CategoryStatus,
    featured: row.featured,
    sortOrder: row.sortOrder,
    highlights: row.highlights ?? [],
    badgeText: row.badgeText,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    heroImageUrl: row.heroImageUrl,
    heroImageAlt: row.heroImageAlt,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    ogImage: row.ogImage,
    noIndex: row.noIndex,
    noFollow: row.noFollow,
    productCount: row.productCount,
  };
}

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const rows = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug));
  return rows.some((r) => r.id !== excludeId);
}

function baseCategoryValues(input: CategoryFormData) {
  return {
    slug: input.slug,
    name: input.name,
    shortDescription: input.shortDescription,
    icon: input.icon,
    status: input.status,
    featured: input.featured,
    sortOrder: input.sortOrder,
    highlights: input.highlights,
    badgeText: input.badgeText || null,
    ctaLabel: input.ctaLabel || null,
    ctaHref: input.ctaHref || null,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt,
    heroImageUrl: input.heroImageUrl || null,
    heroImageAlt: input.heroImageAlt || null,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    ogImage: input.ogImage || null,
    noIndex: input.noIndex,
    noFollow: input.noFollow,
  };
}

export async function createCategory(input: CategoryFormData): Promise<MutationResult> {
  await ensureCategoriesSchemaUpToDate();
  if (await slugTaken(input.slug)) {
    return { success: false, error: "That slug is already used by another category." };
  }
  try {
    const [row] = await db.insert(categories).values(baseCategoryValues(input)).returning({ id: categories.id });
    return { success: true, id: row.id };
  } catch (err) {
    console.error("[admin/categories] createCategory failed:", err);
    return { success: false, error: "Could not create the category. Please try again." };
  }
}

export async function updateCategory(id: string, input: CategoryFormData): Promise<MutationResult> {
  await ensureCategoriesSchemaUpToDate();
  if (await slugTaken(input.slug, id)) {
    return { success: false, error: "That slug is already used by another category." };
  }
  try {
    await db
      .update(categories)
      .set({ ...baseCategoryValues(input), updatedAt: new Date() })
      .where(eq(categories.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/categories] updateCategory failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}

export async function deleteCategory(id: string): Promise<MutationResult> {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (err) {
    // Postgres foreign_key_violation — this category has real products
    // pointing at it (products.categoryId has no cascade, on purpose).
    const code = (err as { code?: string } | null)?.code;
    if (code === "23503") {
      return {
        success: false,
        error: "This category has experiences assigned to it, so it can't be deleted — move them to another category first, or unpublish this one instead.",
      };
    }
    console.error("[admin/categories] deleteCategory failed:", err);
    return { success: false, error: "Could not delete the category. Please try again." };
  }
}

export async function setCategoryStatus(id: string, status: CategoryStatus): Promise<MutationResult> {
  try {
    await db.update(categories).set({ status, updatedAt: new Date() }).where(eq(categories.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/categories] setCategoryStatus failed:", err);
    return { success: false, error: "Could not update status." };
  }
}

export async function setCategoryFeatured(id: string, featured: boolean): Promise<MutationResult> {
  try {
    await db.update(categories).set({ featured, updatedAt: new Date() }).where(eq(categories.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/categories] setCategoryFeatured failed:", err);
    return { success: false, error: "Could not update featured status." };
  }
}

/**
 * Moves `id` one position earlier/later in the admin-list ordering, then
 * rewrites every row's sortOrder as a fresh 0..n-1 sequence matching the
 * new order. Rewriting the whole sequence (rather than just swapping two
 * raw sortOrder values) makes this self-correcting: it produces a
 * visible, deterministic reorder even if existing rows share a sortOrder
 * (e.g. everything still at its schema default of 0), which a bare swap
 * of two equal values would silently fail to do. `createdAt` breaks ties
 * in the "current order" read so that starting-from-all-zeros state is
 * still stable and predictable rather than arbitrary. No-ops quietly at
 * either end of the list — the list UI already disables the button
 * there; this is just the defensive server-side twin of that check.
 */
export async function moveCategory(id: string, direction: "up" | "down"): Promise<MutationResult> {
  try {
    const rows = await db
      .select({ id: categories.id })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return { success: false, error: "Category not found." };
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= rows.length) return { success: true }; // already at the end

    const reordered = [...rows];
    [reordered[index], reordered[neighborIndex]] = [reordered[neighborIndex], reordered[index]];

    await Promise.all(
      reordered.map((row, i) =>
        db.update(categories).set({ sortOrder: i, updatedAt: new Date() }).where(eq(categories.id, row.id)),
      ),
    );
    return { success: true };
  } catch (err) {
    console.error("[admin/categories] moveCategory failed:", err);
    return { success: false, error: "Could not reorder categories." };
  }
}
