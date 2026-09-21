import { eq, and, inArray, sql, desc, asc, gte, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories, suppliers, productImages, productOptions, availability } from "@/lib/db/schema";
import type { ProductBadge, ProductCardSummary } from "@/lib/types";

/**
 * Real repository layer for the product catalog. See the note in
 * src/lib/data/categories.ts — same contract, same "never fetch
 * everything" discipline, now backed by src/lib/db.
 */

type ProductJoinRow = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  categorySlug: string;
  categoryName: string;
  supplierName: string;
  durationLabel: string;
  ratingAverage: number | null;
  reviewCount: number;
  priceFromAmount: number;
  priceFromCurrency: string;
  badges: string[];
};

// One extra query, batched with WHERE IN (never N+1), to attach each
// product's first image — keeps the primary product query a clean
// single-row-per-product join (category/supplier are many-to-one;
// images are one-to-many, so they're fetched separately and merged here).
async function attachPrimaryImages(rows: ProductJoinRow[]): Promise<ProductCardSummary[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const images = await db
    .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt, sortOrder: productImages.sortOrder })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.sortOrder));

  const firstImageByProduct = new Map<string, { url: string; alt: string }>();
  for (const img of images) {
    if (!firstImageByProduct.has(img.productId)) {
      firstImageByProduct.set(img.productId, { url: img.url, alt: img.alt });
    }
  }

  return rows.map((row) => {
    const image = firstImageByProduct.get(row.id) ?? {
      url: "/images/florence-hero.jpg",
      alt: row.title,
    };
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      shortDescription: row.shortDescription,
      categorySlug: row.categorySlug,
      categoryName: row.categoryName,
      supplierName: row.supplierName,
      durationLabel: row.durationLabel,
      ratingAverage: row.ratingAverage,
      reviewCount: row.reviewCount,
      priceFrom: { amount: row.priceFromAmount, currency: row.priceFromCurrency as "EUR" },
      badges: row.badges as ProductBadge[],
      image: { src: image.url, alt: image.alt },
    };
  });
}

const baseSelect = () =>
  db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      shortDescription: products.shortDescription,
      categorySlug: categories.slug,
      categoryName: categories.name,
      supplierName: suppliers.name,
      durationLabel: products.durationLabel,
      ratingAverage: products.ratingAverage,
      reviewCount: products.reviewCount,
      priceFromAmount: products.priceFromAmount,
      priceFromCurrency: products.priceFromCurrency,
      badges: products.badges,
      featuredRank: products.featuredRank,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(suppliers, eq(products.supplierId, suppliers.id));

export async function getFeaturedExperiences(limit = 6): Promise<ProductCardSummary[]> {
  const rows = await baseSelect()
    .where(and(eq(products.status, "live"), eq(products.featured, true)))
    .orderBy(asc(products.featuredRank))
    .limit(limit);
  return attachPrimaryImages(rows);
}

export async function getPopularAttractions(limit = 4): Promise<ProductCardSummary[]> {
  const rows = await baseSelect()
    .where(
      and(
        eq(products.status, "live"),
        inArray(categories.slug, ["skip-the-line-attractions", "museums-galleries"]),
      ),
    )
    .orderBy(asc(products.featuredRank))
    .limit(limit);
  return attachPrimaryImages(rows);
}

export type ProductSortOption = "recommended" | "price-asc" | "price-desc" | "rating";

export interface SearchProductsParams {
  q?: string;
  categorySlug?: string;
  /** ISO date (YYYY-MM-DD). Narrows to products with open availability that day. */
  date?: string;
  sort?: ProductSortOption;
  page?: number;
  pageSize?: number;
}

export interface SearchProductsResult {
  items: ProductCardSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Backs the /experiences listing + search page. Always paginated — never
 * loads the whole catalog — and the WHERE clause always includes
 * `status = 'live'`, which is covered by the `(status, featured,
 * featuredRank)` index on products, plus category filtering hits the
 * `categoryId` index.
 */
export async function searchProducts(params: SearchProductsParams = {}): Promise<SearchProductsResult> {
  const page = Math.max(1, params.page ?? 1);
  // Capped well above the /experiences page's own pageSize=12, since a
  // few callers deliberately ask for the whole live catalog in one page
  // (sitemap.ts, generateStaticParams, the homepage sections) rather
  // than paging through it. 24 was tight enough to silently truncate
  // those the moment the catalog passed 24 products — bumped to 100 so
  // "give me everything" callers actually get everything as the catalog
  // grows, while still bounding worst-case query size.
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 12));

  const conditions: SQL[] = [eq(products.status, "live")];
  if (params.categorySlug) {
    conditions.push(eq(categories.slug, params.categorySlug));
  }
  if (params.q && params.q.trim().length > 0) {
    const term = `%${params.q.trim().toLowerCase()}%`;
    conditions.push(
      sql`(lower(${products.title}) LIKE ${term} OR lower(${products.shortDescription}) LIKE ${term} OR lower(${categories.name}) LIKE ${term})`,
    );
  }
  if (params.date) {
    // Only products with an availability row for that date that isn't
    // fully booked — hits the (productId, date) unique index.
    conditions.push(
      sql`${products.id} IN (SELECT product_id FROM availability WHERE date = ${params.date} AND capacity_booked < capacity_total)`,
    );
  }
  const where = and(...conditions);

  // ::int — Postgres count() is bigint, which node-postgres returns as a
  // string by default; cast so `count` stays a JS number.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(suppliers, eq(products.supplierId, suppliers.id))
    .where(where);

  const orderBy =
    params.sort === "price-asc"
      ? asc(products.priceFromAmount)
      : params.sort === "price-desc"
        ? desc(products.priceFromAmount)
        : params.sort === "rating"
          ? desc(products.ratingAverage)
          : asc(products.featuredRank);

  const rows = await baseSelect()
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const items = await attachPrimaryImages(rows);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return { items, total: count, page, pageSize, totalPages };
}

// -----------------------------------------------------------------------
// Product detail page
// -----------------------------------------------------------------------

export interface ProductOptionSummary {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number;
  priceCurrency: string;
}

export interface ProductDetail {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  meetingPoint: string | null;
  cancellationPolicy: string;
  durationLabel: string;
  priceFrom: { amount: number; currency: "EUR" };
  ratingAverage: number | null;
  reviewCount: number;
  badges: ProductBadge[];
  categorySlug: string;
  categoryName: string;
  supplierName: string;
  images: { src: string; alt: string }[];
  options: ProductOptionSummary[];
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const [row] = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      shortDescription: products.shortDescription,
      description: products.description,
      highlights: products.highlights,
      inclusions: products.inclusions,
      exclusions: products.exclusions,
      meetingPoint: products.meetingPoint,
      cancellationPolicy: products.cancellationPolicy,
      durationLabel: products.durationLabel,
      priceFromAmount: products.priceFromAmount,
      priceFromCurrency: products.priceFromCurrency,
      ratingAverage: products.ratingAverage,
      reviewCount: products.reviewCount,
      badges: products.badges,
      categorySlug: categories.slug,
      categoryName: categories.name,
      supplierName: suppliers.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(suppliers, eq(products.supplierId, suppliers.id))
    .where(and(eq(products.slug, slug), eq(products.status, "live")));

  if (!row) return null;

  const images = await db
    .select({ url: productImages.url, alt: productImages.alt })
    .from(productImages)
    .where(eq(productImages.productId, row.id))
    .orderBy(asc(productImages.sortOrder));

  const options = await db
    .select({
      id: productOptions.id,
      name: productOptions.name,
      description: productOptions.description,
      priceAmount: productOptions.priceAmount,
      priceCurrency: productOptions.priceCurrency,
    })
    .from(productOptions)
    .where(and(eq(productOptions.productId, row.id), eq(productOptions.isActive, true)))
    .orderBy(asc(productOptions.sortOrder));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    description: row.description,
    highlights: row.highlights as string[],
    inclusions: row.inclusions as string[],
    exclusions: row.exclusions as string[],
    meetingPoint: row.meetingPoint,
    cancellationPolicy: row.cancellationPolicy,
    durationLabel: row.durationLabel,
    priceFrom: { amount: row.priceFromAmount, currency: row.priceFromCurrency as "EUR" },
    ratingAverage: row.ratingAverage,
    reviewCount: row.reviewCount,
    badges: row.badges as ProductBadge[],
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    supplierName: row.supplierName,
    images: images.length > 0 ? images.map((i) => ({ src: i.url, alt: i.alt })) : [{ src: "/images/florence-hero.jpg", alt: row.title }],
    options,
  };
}

export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4): Promise<ProductCardSummary[]> {
  const rows = await baseSelect()
    .where(
      and(
        eq(products.status, "live"),
        eq(categories.slug, categorySlug),
        sql`${products.id} != ${productId}`,
      ),
    )
    .orderBy(asc(products.featuredRank))
    .limit(limit);
  return attachPrimaryImages(rows);
}

/**
 * Availability for a single product over a date window, used by the
 * product page's date picker and re-validated again at checkout. Only
 * ever queried for one product and a bounded window — never the whole
 * availability table — via the `(productId, date)` unique index.
 */
export async function getProductAvailability(productId: string, fromDate: string, toDate: string) {
  return db
    .select({
      date: availability.date,
      capacityTotal: availability.capacityTotal,
      capacityBooked: availability.capacityBooked,
    })
    .from(availability)
    .where(
      and(
        eq(availability.productId, productId),
        gte(availability.date, fromDate),
        sql`${availability.date} <= ${toDate}`,
      ),
    )
    .orderBy(asc(availability.date));
}
