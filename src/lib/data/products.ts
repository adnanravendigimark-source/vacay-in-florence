import { eq, and, inArray, sql, desc, asc, gte, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories, suppliers, productImages, productOptions, availability } from "@/lib/db/schema";
import type { ProductBadge, ProductCardSummary } from "@/lib/types";
import { ensureSearchIndexes } from "@/lib/db/search-indexes";
import { geocodeAddress } from "@/lib/geocoding";

/**
 * Smart-search query normalization, shared by searchProducts() and
 * searchProductSuggestions() (and by categories.ts's own suggestion
 * search) so "the same query typed twice" always matches the same way.
 *
 * Strips a short list of filler words so a natural-language query like
 * "things to do in Florence" reduces to its meaningful terms ("florence")
 * instead of requiring every stopword to also appear in the product
 * text. Falls back to the untouched word list if stripping stopwords
 * would leave nothing (e.g. a query that's *only* filler words).
 */
const SEARCH_STOPWORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "do", "does", "of", "for", "with",
  "near", "things", "thing", "and", "or", "is", "are", "it", "this", "that",
  "what", "where", "best", "top", "some", "me", "find", "show",
]);

export function tokenizeSearchQuery(raw: string): string[] {
  const words = raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = words.filter((w) => !SEARCH_STOPWORDS.has(w) && w.length > 1);
  return meaningful.length > 0 ? meaningful : words;
}

/**
 * Builds the fuzzy/partial-match WHERE condition for a search term across
 * product title, short description, category name, and supplier name.
 *
 * Combines three techniques so common query shapes all work:
 * - `ILIKE '%term%'` — fast substring match (hits the trigram indexes too).
 * - `word_similarity()` — matches a token against the best-matching
 *   substring of a longer field, so "uffizi" scores well against
 *   "Uffizi Gallery Skip-the-Line Ticket" even though it's not the whole
 *   title.
 * - `similarity()` on the whole phrase vs. title — spelling-variation
 *   tolerance for typos ("Ufizzi", "musuem") that ILIKE alone would miss.
 *
 * Requires the `pg_trgm` extension (see src/lib/db/search-indexes.ts).
 */
function buildSearchCondition(rawQuery: string): SQL {
  const trimmed = rawQuery.trim();
  const tokens = tokenizeSearchQuery(trimmed);

  // 0.42 is empirically tuned, not a default: measured directly against
  // the catalog (see the debug queries this was built with). A random
  // short word like "wine" or "tasting" scores a consistent ~0.4 against
  // completely unrelated titles just from incidental trigram overlap —
  // that's noise, not a match. A genuine one-letter-typo like "musuem"
  // vs. "Museums & Galleries" scores ~0.43. 0.42 sits in the gap between
  // them: keeps the real typo tolerance, drops the coincidental noise.
  const WORD_SIMILARITY_THRESHOLD = 0.42;

  const tokenConditions = tokens.map((token) => {
    const like = `%${token}%`;
    return sql`(
      ${products.title} ILIKE ${like}
      OR ${products.shortDescription} ILIKE ${like}
      OR ${categories.name} ILIKE ${like}
      OR ${suppliers.name} ILIKE ${like}
      OR word_similarity(${token}, ${products.title}) > ${WORD_SIMILARITY_THRESHOLD}
      OR word_similarity(${token}, ${categories.name}) > ${WORD_SIMILARITY_THRESHOLD}
    )`;
  });

  // Whole-phrase fuzzy fallback — catches typo'd multi-word phrases
  // ("ufizzi galery") that token-by-token matching can miss. 0.3 matches
  // pg_trgm's own default similarity threshold for the `%` operator.
  const phraseCondition = sql`similarity(${products.title}, ${trimmed}) > 0.3`;

  return sql`(${sql.join(tokenConditions, sql` OR `)} OR ${phraseCondition})`;
}

/**
 * Same relevance signal as buildSearchCondition, expressed as a numeric
 * score for ORDER BY instead of a boolean filter. Exact/near-exact title
 * matches rank highest, then category matches, then loose description
 * matches — so "Uffizi" surfaces the Uffizi ticket before anything that
 * merely mentions Florence in its description.
 */
function buildRelevanceScore(rawQuery: string): SQL<number> {
  const trimmed = rawQuery.trim();
  const like = `%${trimmed.toLowerCase()}%`;
  const tokens = tokenizeSearchQuery(trimmed);
  const tokenTitleHits = tokens.length
    ? sql.join(
        tokens.map((t) => sql`word_similarity(${t}, ${products.title})`),
        sql` + `,
      )
    : sql`0`;

  return sql<number>`(
    (CASE WHEN lower(${products.title}) LIKE ${like} THEN 4 ELSE 0 END)
    + similarity(${products.title}, ${trimmed}) * 3
    + (${tokenTitleHits}) * 2
    + (CASE WHEN lower(${categories.name}) LIKE ${like} THEN 1.5 ELSE 0 END)
    + similarity(${categories.name}, ${trimmed})
    + (CASE WHEN lower(${products.shortDescription}) LIKE ${like} THEN 0.5 ELSE 0 END)
  )`;
}

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

  const hasQuery = Boolean(params.q && params.q.trim().length > 0);
  if (hasQuery) {
    // Fuzzy/partial search needs pg_trgm's similarity()/word_similarity();
    // make sure the extension + indexes exist before relying on them
    // (no-op after the first call in this process — see search-indexes.ts).
    await ensureSearchIndexes();
  }

  const conditions: SQL[] = [eq(products.status, "live")];
  if (params.categorySlug) {
    conditions.push(eq(categories.slug, params.categorySlug));
  }
  if (hasQuery) {
    conditions.push(buildSearchCondition(params.q!));
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

  // A free-text query defaults to best-match-first ("recommended" without
  // a query still means editorially-featured-first); an explicit sort
  // choice (price/rating) is always respected, query or not, per the
  // "results update correctly based on all selected filters" requirement.
  const orderBy =
    params.sort === "price-asc"
      ? asc(products.priceFromAmount)
      : params.sort === "price-desc"
        ? desc(products.priceFromAmount)
        : params.sort === "rating"
          ? desc(products.ratingAverage)
          : hasQuery
            ? desc(buildRelevanceScore(params.q!))
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

export interface ProductSuggestion {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  priceFrom: { amount: number; currency: "EUR" };
}

/**
 * Backs the search bar's autocomplete dropdown. Deliberately narrow:
 * text fields only (no image join, no total count) and a small, fixed
 * LIMIT, so every keystroke's request stays cheap — this is called far
 * more often (once per debounced keystroke) than searchProducts() itself.
 */
export async function searchProductSuggestions(rawQuery: string, limit = 5): Promise<ProductSuggestion[]> {
  const trimmed = rawQuery.trim();
  if (trimmed.length === 0) return [];

  await ensureSearchIndexes();

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      categoryName: categories.name,
      priceFromAmount: products.priceFromAmount,
      priceFromCurrency: products.priceFromCurrency,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    // buildSearchCondition() also matches on supplier name (e.g. a
    // supplier's own brand name typed into search), so this join has to
    // be here even though the column itself isn't selected — same join
    // shape as baseSelect()/searchProducts().
    .innerJoin(suppliers, eq(products.supplierId, suppliers.id))
    .where(and(eq(products.status, "live"), buildSearchCondition(trimmed)))
    .orderBy(desc(buildRelevanceScore(trimmed)))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    categoryName: row.categoryName,
    priceFrom: { amount: row.priceFromAmount, currency: row.priceFromCurrency as "EUR" },
  }));
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
  meetingCity: string | null;
  meetingCountry: string | null;
  // Real coordinates for the meeting point. Backed by the stored
  // meetingLat/meetingLng when present; otherwise getProductBySlug
  // geocodes meetingPoint/City/Country on the fly and writes the result
  // back to the row. Null only when there's no address to geocode, or
  // geocoding failed — the map renders an honest fallback, never a
  // fake/guessed pin.
  meetingLocation: { lat: number; lng: number } | null;
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

type MeetingRow = {
  id: string;
  meetingPoint: string | null;
  meetingCity: string | null;
  meetingCountry: string | null;
  meetingLat: number | null;
  meetingLng: number | null;
};

// Stored coordinates win outright — no network call on the common path.
// Only a product with an address but no coordinates yet triggers a
// geocode, and a successful result is persisted so it never happens again
// for that product. A geocoding failure (bad address, API down, no token
// configured) resolves to null rather than throwing, so a broken map
// never takes the rest of the product page down with it.
async function resolveMeetingLocation(
  row: MeetingRow
): Promise<{ lat: number; lng: number } | null> {
  if (row.meetingLat != null && row.meetingLng != null) {
    return { lat: row.meetingLat, lng: row.meetingLng };
  }

  const hasAddress = Boolean(row.meetingPoint || row.meetingCity || row.meetingCountry);
  if (!hasAddress) return null;

  const geocoded = await geocodeAddress({
    address: row.meetingPoint,
    city: row.meetingCity,
    country: row.meetingCountry,
  });
  if (!geocoded) return null;

  try {
    await db
      .update(products)
      .set({ meetingLat: geocoded.lat, meetingLng: geocoded.lng })
      .where(eq(products.id, row.id));
  } catch (err) {
    // Serving the geocoded location is more important than persisting it —
    // worst case, the next request geocodes the same address again.
    console.error("[products] Failed to persist geocoded meeting location:", err);
  }

  return geocoded;
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
      meetingCity: products.meetingCity,
      meetingCountry: products.meetingCountry,
      meetingLat: products.meetingLat,
      meetingLng: products.meetingLng,
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

  const meetingLocation = await resolveMeetingLocation(row);

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
    meetingCity: row.meetingCity,
    meetingCountry: row.meetingCountry,
    meetingLocation,
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
