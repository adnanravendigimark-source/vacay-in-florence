import "server-only";
import { eq, and, sql, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { getPgErrorCode } from "@/lib/db/errors";
import { attractions, products } from "@/lib/db/schema";
import { ensureAttractionsSchemaUpToDate } from "@/lib/data/attractions";
import type { AttractionFormData } from "@/lib/validation/attractions";
import type { CategoryIcon, AttractionStatus } from "@/lib/types";

/**
 * Admin-scoped repository over `attractions` — unlike
 * src/lib/data/attractions.ts (the public repository, which only ever
 * returns status="published" rows with at least one live product), every
 * function here can see and act on drafts and empty attractions too,
 * since admin needs to manage one before it has any tickets assigned or
 * goes live. Mirrors src/lib/data/admin/categories.ts field-for-field.
 */

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface AdminAttractionListItem {
  id: string;
  slug: string;
  name: string;
  icon: CategoryIcon;
  imageUrl: string;
  imageAlt: string;
  status: AttractionStatus;
  featured: boolean;
  sortOrder: number;
  productCount: number;
}

export interface AdminAttractionDetail {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  icon: CategoryIcon;
  status: AttractionStatus;
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
      id: attractions.id,
      slug: attractions.slug,
      name: attractions.name,
      shortDescription: attractions.shortDescription,
      icon: attractions.icon,
      imageUrl: attractions.imageUrl,
      imageAlt: attractions.imageAlt,
      heroImageUrl: attractions.heroImageUrl,
      heroImageAlt: attractions.heroImageAlt,
      status: attractions.status,
      featured: attractions.featured,
      sortOrder: attractions.sortOrder,
      highlights: attractions.highlights,
      badgeText: attractions.badgeText,
      ctaLabel: attractions.ctaLabel,
      ctaHref: attractions.ctaHref,
      metaTitle: attractions.metaTitle,
      metaDescription: attractions.metaDescription,
      canonicalUrl: attractions.canonicalUrl,
      ogImage: attractions.ogImage,
      noIndex: attractions.noIndex,
      noFollow: attractions.noFollow,
      productCount: sql<number>`count(${products.id})::int`.as("productCount"),
    })
    .from(attractions)
    .leftJoin(products, and(eq(products.attractionId, attractions.id), eq(products.status, "live")))
    .groupBy(attractions.id);

export async function listAdminAttractions(): Promise<AdminAttractionListItem[]> {
  await ensureAttractionsSchemaUpToDate();
  const rows = await withProductCount().orderBy(asc(attractions.sortOrder));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon as CategoryIcon,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    status: row.status as AttractionStatus,
    featured: row.featured,
    sortOrder: row.sortOrder,
    productCount: row.productCount,
  }));
}

export async function getAdminAttractionById(id: string): Promise<AdminAttractionDetail | null> {
  await ensureAttractionsSchemaUpToDate();
  const [row] = await withProductCount().where(eq(attractions.id, id));
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    icon: row.icon as CategoryIcon,
    status: row.status as AttractionStatus,
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
  const rows = await db.select({ id: attractions.id }).from(attractions).where(eq(attractions.slug, slug));
  return rows.some((r) => r.id !== excludeId);
}

function baseAttractionValues(input: AttractionFormData) {
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

export async function createAttraction(input: AttractionFormData): Promise<MutationResult> {
  await ensureAttractionsSchemaUpToDate();
  if (await slugTaken(input.slug)) {
    return { success: false, error: "That slug is already used by another attraction." };
  }
  try {
    const [row] = await db.insert(attractions).values(baseAttractionValues(input)).returning({ id: attractions.id });
    return { success: true, id: row.id };
  } catch (err) {
    console.error("[admin/attractions] createAttraction failed:", err);
    return { success: false, error: "Could not create the attraction. Please try again." };
  }
}

export async function updateAttraction(id: string, input: AttractionFormData): Promise<MutationResult> {
  await ensureAttractionsSchemaUpToDate();
  if (await slugTaken(input.slug, id)) {
    return { success: false, error: "That slug is already used by another attraction." };
  }
  try {
    await db
      .update(attractions)
      .set({ ...baseAttractionValues(input), updatedAt: new Date() })
      .where(eq(attractions.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/attractions] updateAttraction failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}

export async function deleteAttraction(id: string): Promise<MutationResult> {
  try {
    await db.delete(attractions).where(eq(attractions.id, id));
    return { success: true };
  } catch (err) {
    // Postgres foreign_key_violation — this attraction has real products
    // pointing at it (products.attractionId has no cascade, on purpose).
    const code = getPgErrorCode(err);
    if (code === "23503") {
      return {
        success: false,
        error:
          "This attraction has experiences assigned to it, so it can't be deleted — move them to another attraction first, or unpublish this one instead.",
      };
    }
    console.error("[admin/attractions] deleteAttraction failed:", err);
    return { success: false, error: "Could not delete the attraction. Please try again." };
  }
}

export async function setAttractionStatus(id: string, status: AttractionStatus): Promise<MutationResult> {
  try {
    await db.update(attractions).set({ status, updatedAt: new Date() }).where(eq(attractions.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/attractions] setAttractionStatus failed:", err);
    return { success: false, error: "Could not update status." };
  }
}

export async function setAttractionFeatured(id: string, featured: boolean): Promise<MutationResult> {
  try {
    await db.update(attractions).set({ featured, updatedAt: new Date() }).where(eq(attractions.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/attractions] setAttractionFeatured failed:", err);
    return { success: false, error: "Could not update featured status." };
  }
}

/**
 * Moves `id` one position earlier/later in the admin-list ordering, then
 * rewrites every row's sortOrder as a fresh 0..n-1 sequence matching the
 * new order — same self-correcting, whole-sequence-rewrite reorder
 * pattern used elsewhere in this admin layer (rewriting the whole
 * sequence, rather than swapping two raw sortOrder values, is what
 * makes it self-correcting even when existing rows share a sortOrder).
 */
export async function moveAttraction(id: string, direction: "up" | "down"): Promise<MutationResult> {
  try {
    const rows = await db
      .select({ id: attractions.id })
      .from(attractions)
      .orderBy(asc(attractions.sortOrder), asc(attractions.createdAt));
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return { success: false, error: "Attraction not found." };
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= rows.length) return { success: true }; // already at the end

    const reordered = [...rows];
    [reordered[index], reordered[neighborIndex]] = [reordered[neighborIndex], reordered[index]];

    await Promise.all(
      reordered.map((row, i) =>
        db.update(attractions).set({ sortOrder: i, updatedAt: new Date() }).where(eq(attractions.id, row.id)),
      ),
    );
    return { success: true };
  } catch (err) {
    console.error("[admin/attractions] moveAttraction failed:", err);
    return { success: false, error: "Could not reorder attractions." };
  }
}
