import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getPgErrorCode } from "@/lib/db/errors";
import { categories, products } from "@/lib/db/schema";
import type { CategoryIcon, CategoryStatus, CategorySummary } from "@/lib/types";
import { ensureSearchIndexes } from "@/lib/db/search-indexes";
import { tokenizeSearchQuery } from "@/lib/data/products";

/**
 * Real repository layer, backed by src/lib/db (Drizzle + Neon Postgres).
 * Every function still takes a `limit`/pagination argument and nothing
 * here fetches the full catalog, matching the original TODO(db) contract
 * this file replaces.
 */

let categoriesSchemaEnsured = false;

async function alterCategoriesColumn(statement: ReturnType<typeof sql>) {
  try {
    await db.execute(statement);
  } catch (err) {
    const code = getPgErrorCode(err);
    if (code !== "42701") throw err;
  }
}

/**
 * Additive column migration for `categories`, run lazily and idempotently
 * (same pattern as ensureProductsSchemaUpToDate() in ./products.ts) since
 * this environment cannot run `drizzle-kit push` against the live Neon DB
 * directly. Cached per process so it's a no-op after the first call.
 */
export async function ensureCategoriesSchemaUpToDate() {
  if (categoriesSchemaEnsured) return;
  try {
    await alterCategoriesColumn(
      sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'published';`,
    );
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "hero_image_url" text;`);
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "hero_image_alt" text;`);
    await alterCategoriesColumn(
      sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "highlights" jsonb NOT NULL DEFAULT '[]'::jsonb;`,
    );
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "badge_text" text;`);
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "cta_label" text;`);
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "cta_href" text;`);
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "meta_title" text;`);
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "meta_description" text;`);
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "canonical_url" text;`);
    await alterCategoriesColumn(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "og_image" text;`);
    await alterCategoriesColumn(
      sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "no_index" boolean NOT NULL DEFAULT false;`,
    );
    await alterCategoriesColumn(
      sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "no_follow" boolean NOT NULL DEFAULT false;`,
    );
    await backfillLaunchContent();
    categoriesSchemaEnsured = true;
  } catch (err) {
    console.error("Error migrating categories columns:", err);
  }
}

/**
 * One-time content backfill for the 6 categories that existed before this
 * migration, so `highlights`/`badgeText`/`heroImageUrl` don't render empty
 * the first time the new admin fields go live. Each UPDATE is scoped with
 * `AND highlights = '[]' AND badge_text IS NULL` (or `AND hero_image_url
 * IS NULL`) so it only ever touches a row still at its just-migrated
 * default — safe to re-run on every process start, and it can never
 * overwrite a real admin edit, including an admin deliberately clearing a
 * field back to empty (same narrow-backfill convention as
 * ensureHomepageTableExistsUncached() in ./homepage.ts).
 *
 * heroImageUrl values reuse the same 5 photos the old hardcoded
 * MOSAIC_IMAGE map in categories-hero.tsx pointed at (now removed in
 * favor of this DB column), so the public hero looks identical the first
 * time this runs; "outdoor-active" had no entry in that map and keeps
 * falling back to its own card image, exactly as before.
 */
async function backfillLaunchContent() {
  const seed: {
    slug: string;
    badgeText: string;
    highlights: string[];
    heroImageUrl?: string;
  }[] = [
    {
      slug: "skip-the-line-attractions",
      badgeText: "Most Popular",
      highlights: [
        "Duomo dome climb & terrace access",
        "Skip the ticket-office queue entirely",
        "Fixed entry time, no waiting",
      ],
      heroImageUrl: "/images/hero2-duomo-terrace.jpg",
    },
    {
      slug: "museums-galleries",
      badgeText: "Editor's Pick",
      highlights: [
        "Uffizi Gallery & the Accademia's David",
        "Timed-entry tickets, zero queueing",
        "Expert-led gallery walkthroughs available",
      ],
      heroImageUrl: "/images/hero2-uffizi-corridor.jpg",
    },
    {
      slug: "guided-tours",
      badgeText: "Locally Led",
      highlights: [
        "Small-group and private options",
        "Led by licensed local guides",
        "Historic center, Ponte Vecchio & beyond",
      ],
      heroImageUrl: "/images/hero2-guided-tour.jpg",
    },
    {
      slug: "food-wine-experiences",
      badgeText: "Top Rated",
      highlights: [
        "Chianti wine tastings in historic cellars",
        "Hands-on pasta & gelato classes",
        "Guided San Lorenzo market tours",
      ],
      heroImageUrl: "/images/hero2-chianti-wine.jpg",
    },
    {
      slug: "day-trips-from-florence",
      badgeText: "Full-Day Escapes",
      highlights: [
        "Siena, San Gimignano & Pisa in a day",
        "Comfortable transport included",
        "Small-group countryside excursions",
      ],
      heroImageUrl: "/images/hero2-florence-panorama.jpg",
    },
    {
      slug: "outdoor-active",
      badgeText: "Off the Beaten Path",
      highlights: [
        "River Arno boat cruises",
        "E-bike rides through the Tuscan hills",
        "Active ways to see the countryside",
      ],
    },
  ];

  for (const row of seed) {
    await db.execute(sql`
      UPDATE "categories"
      SET "highlights" = ${JSON.stringify(row.highlights)}::jsonb, "badge_text" = ${row.badgeText}
      WHERE "slug" = ${row.slug} AND "highlights" = '[]'::jsonb AND "badge_text" IS NULL;
    `);
    if (row.heroImageUrl) {
      await db.execute(sql`
        UPDATE "categories"
        SET "hero_image_url" = ${row.heroImageUrl}
        WHERE "slug" = ${row.slug} AND "hero_image_url" IS NULL;
      `);
    }
  }
}

type CategoryRow = {
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

function toSummary(row: CategoryRow): CategorySummary {
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
    status: row.status as CategoryStatus,
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

// Live product count per category, computed in the same query rather than
// N+1'd per card — one indexed join + group by.
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
      featured: categories.featured,
      sortOrder: categories.sortOrder,
      status: categories.status,
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

export async function getFeaturedCategories(limit = 6): Promise<CategorySummary[]> {
  await ensureCategoriesSchemaUpToDate();
  const rows = await withProductCount()
    .where(and(eq(categories.featured, true), eq(categories.status, "published")))
    .orderBy(categories.sortOrder)
    .limit(limit);
  return rows.map(toSummary);
}

export async function getAllCategories(): Promise<CategorySummary[]> {
  await ensureCategoriesSchemaUpToDate();
  const rows = await withProductCount().where(eq(categories.status, "published")).orderBy(categories.sortOrder);
  return rows.map(toSummary);
}

/**
 * `options.anyStatus` lets a staff-only preview bypass a draft category's
 * public 404 (mirrors getProductBySlug's `previewOptions.anyStatus` in
 * ./products.ts) — never trusted from the client, only set after a
 * server-side getStaffContext() check.
 */
export async function getCategoryBySlug(
  slug: string,
  options?: { anyStatus?: boolean },
): Promise<CategorySummary | null> {
  await ensureCategoriesSchemaUpToDate();
  const condition = options?.anyStatus
    ? eq(categories.slug, slug)
    : and(eq(categories.slug, slug), eq(categories.status, "published"));
  const [row] = await withProductCount().where(condition);
  return row ? toSummary(row) : null;
}

export interface CategorySuggestion {
  id: string;
  slug: string;
  name: string;
  productCount: number;
}

/**
 * Backs the search bar's autocomplete dropdown — a small, fast,
 * text-only lookup (categories table is tiny, but this still avoids
 * `getAllCategories()` + client-side filtering so it stays cheap as the
 * catalog grows and stays consistent with searchProductSuggestions()'s
 * fuzzy/partial-match behavior).
 */
export async function searchCategorySuggestions(rawQuery: string, limit = 4): Promise<CategorySuggestion[]> {
  const trimmed = rawQuery.trim();
  if (trimmed.length === 0) return [];

  await ensureSearchIndexes();

  const tokens = tokenizeSearchQuery(trimmed);
  // Thresholds (0.42 word-level, 0.3 phrase-level) match
  // buildSearchCondition() in products.ts — see the comment there for
  // how they were tuned against the real catalog.
  const tokenConditions = tokens.map((token) => {
    const like = `%${token}%`;
    return sql`(${categories.name} ILIKE ${like} OR word_similarity(${token}, ${categories.name}) > 0.42)`;
  });
  const condition = sql`(${sql.join(tokenConditions, sql` OR `)} OR similarity(${categories.name}, ${trimmed}) > 0.3)`;

  const rows = await withProductCount()
    .where(condition)
    .orderBy(sql`similarity(${categories.name}, ${trimmed}) DESC`)
    .limit(limit);

  return rows.map((row) => ({ id: row.id, slug: row.slug, name: row.name, productCount: row.productCount }));
}
