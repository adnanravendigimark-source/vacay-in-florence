import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import type { CategoryIcon, CategorySummary } from "@/lib/types";

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
