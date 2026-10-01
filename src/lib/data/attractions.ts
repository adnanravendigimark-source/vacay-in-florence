import "server-only";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attractions, products } from "@/lib/db/schema";
import type { CategoryIcon, AttractionStatus, AttractionSummary } from "@/lib/types";

/**
 * Public repository over `attractions` — the new top level of the public
 * /experiences hierarchy (Attraction -> its tickets/tours -> single
 * ticket detail page). Same "never fetch everything, always filter to
 * status=published" contract as src/lib/data/categories.ts.
 */

let attractionsSchemaEnsured = false;

/**
 * `attractions` is a brand-new table (not new columns on an existing
 * one), so this is a CREATE TABLE IF NOT EXISTS rather than a series of
 * ALTER TABLE ADD COLUMNs — same lazy, idempotent, run-once-per-process
 * migration convention as ensureCategoriesSchemaUpToDate()/
 * ensureProductsSchemaUpToDate(), since this environment cannot run
 * `drizzle-kit push` directly against the live Neon DB.
 */
export async function ensureAttractionsSchemaUpToDate() {
  if (attractionsSchemaEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "attractions" (
        "id" text PRIMARY KEY,
        "slug" text NOT NULL,
        "name" text NOT NULL,
        "short_description" text NOT NULL,
        "icon" text NOT NULL,
        "image_url" text NOT NULL,
        "image_alt" text NOT NULL,
        "featured" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "status" text NOT NULL DEFAULT 'draft',
        "hero_image_url" text,
        "hero_image_alt" text,
        "highlights" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "badge_text" text,
        "cta_label" text,
        "cta_href" text,
        "meta_title" text,
        "meta_description" text,
        "canonical_url" text,
        "og_image" text,
        "no_index" boolean NOT NULL DEFAULT false,
        "no_follow" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "attractions_slug_idx" ON "attractions" ("slug");`);
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS "attractions_featured_sort_idx" ON "attractions" ("featured", "sort_order");`,
    );
    // products.attraction_id is added by ensureProductsSchemaUpToDate()
    // (src/lib/data/products.ts), which calls this function first so the
    // table it references already exists.
    attractionsSchemaEnsured = true;
  } catch (err) {
    console.error("Error migrating attractions table:", err);
  }
}

type AttractionRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  imageUrl: string;
  imageAlt: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  featured: boolean;
  sortOrder: number;
  status: string;
  highlights: string[];
  badgeText: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
  productCount: number;
};

function toSummary(row: AttractionRow): AttractionSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    icon: row.icon as CategoryIcon,
    image: { src: row.imageUrl, alt: row.imageAlt },
    heroImage: row.heroImageUrl ? { src: row.heroImageUrl, alt: row.heroImageAlt || row.imageAlt } : null,
    productCount: row.productCount,
    featured: row.featured,
    sortOrder: row.sortOrder,
    status: row.status as AttractionStatus,
    highlights: row.highlights ?? [],
    badgeText: row.badgeText,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    ogImage: row.ogImage,
    noIndex: row.noIndex,
    noFollow: row.noFollow,
  };
}

// Live product count per attraction, computed in the same query (one
// indexed join + group by) rather than N+1'd per card — same pattern as
// categories.ts's withProductCount().
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
      featured: attractions.featured,
      sortOrder: attractions.sortOrder,
      status: attractions.status,
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

/**
 * Every attraction shown on the public /experiences page — published,
 * AND with at least one live ticket assigned to it (HAVING count > 0), so
 * an admin-created-but-not-yet-assigned attraction never shows an empty
 * card that leads to a dead end.
 */
export async function getAllAttractions(): Promise<AttractionSummary[]> {
  await ensureAttractionsSchemaUpToDate();
  const rows = await withProductCount()
    .where(eq(attractions.status, "published"))
    .having(sql`count(${products.id}) > 0`)
    .orderBy(attractions.sortOrder);
  return rows.map(toSummary);
}

export async function getFeaturedAttractions(limit = 6): Promise<AttractionSummary[]> {
  await ensureAttractionsSchemaUpToDate();
  const rows = await withProductCount()
    .where(and(eq(attractions.featured, true), eq(attractions.status, "published")))
    .having(sql`count(${products.id}) > 0`)
    .orderBy(attractions.sortOrder)
    .limit(limit);
  return rows.map(toSummary);
}

/**
 * `options.anyStatus` lets a staff-only preview bypass a draft
 * attraction's public 404 — never trusted from the client, only set
 * after a server-side getStaffContext() check (mirrors
 * getCategoryBySlug's identical option in ./categories.ts).
 */
export async function getAttractionBySlug(
  slug: string,
  options?: { anyStatus?: boolean },
): Promise<AttractionSummary | null> {
  await ensureAttractionsSchemaUpToDate();
  const condition = options?.anyStatus
    ? eq(attractions.slug, slug)
    : and(eq(attractions.slug, slug), eq(attractions.status, "published"));
  const [row] = await withProductCount().where(condition);
  return row ? toSummary(row) : null;
}
