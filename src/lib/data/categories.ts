import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import type { CategoryIcon, CategorySummary } from "@/lib/types";
import { ensureSearchIndexes } from "@/lib/db/search-indexes";
import { tokenizeSearchQuery } from "@/lib/data/products";

/**
 * Real repository layer, backed by src/lib/db (Drizzle + Neon Postgres).
 * Every function still takes a `limit`/pagination argument and nothing
 * here fetches the full catalog, matching the original TODO(db) contract
 * this file replaces.
 */

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
  sortOrder: number;
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
    productCount: row.productCount,
    featured: row.featured,
    sortOrder: row.sortOrder,
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
      featured: categories.featured,
      sortOrder: categories.sortOrder,
            // ::int — Postgres count() is bigint, which node-postgres returns
      // as a string by default; cast so productCount stays a JS number.
      productCount: sql<number>`count(${products.id})::int`.as("productCount"),
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.status, "live")))
    .groupBy(categories.id);

export async function getFeaturedCategories(limit = 6): Promise<CategorySummary[]> {
  const rows = await withProductCount()
    .where(eq(categories.featured, true))
    .orderBy(categories.sortOrder)
    .limit(limit);
  return rows.map(toSummary);
}

export async function getAllCategories(): Promise<CategorySummary[]> {
  const rows = await withProductCount().orderBy(categories.sortOrder);
  return rows.map(toSummary);
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  const [row] = await withProductCount().where(eq(categories.slug, slug));
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
