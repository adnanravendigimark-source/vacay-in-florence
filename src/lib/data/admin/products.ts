import { and, asc, desc, eq, gte, ilike, inArray, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories, suppliers, productImages, productOptions, availability } from "@/lib/db/schema";
import { ensureProductsSchemaUpToDate, getProductAvailability } from "@/lib/data/products";
import { pctChange } from "@/lib/data/admin/dashboard";
import type { ProductFormData } from "@/lib/validation/products";

/**
 * Admin-scoped repository for the Experience Editor. Deliberately
 * separate from src/lib/data/products.ts, which stays customer-facing
 * (status="live" only, paginated summaries) — this file is the one place
 * allowed to read/write every status and every column, matching the
 * "admin queries live in src/lib/data/admin/" convention from the Master
 * Admin Panel plan.
 *
 * Same database, same tables as the public site — there is no parallel
 * admin-only content anywhere here. Every column written here is a real
 * column the public product page (or its data layer) already reads.
 */

export type ProductStatus = "draft" | "pending_review" | "live" | "paused";

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Stat cards (real counts + real "vs. previous 30 days" trend — same
// pctChange helper and null-when-no-baseline honesty as the dashboard,
// see src/lib/data/admin/dashboard.ts. Trend is computed from products
// *created* in each 30-day window that match the stat's criteria, since
// there's no separate history/snapshot table to diff a point-in-time
// count against — an honest, real proxy, not a fabricated number.)
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ExperienceStat {
  value: number;
  trendPct: number | null;
}

export interface ExperienceStats {
  total: ExperienceStat;
  published: ExperienceStat;
  draft: ExperienceStat;
  featured: ExperienceStat;
}

function countProducts(where?: ReturnType<typeof and>): Promise<number> {
  return db
    .select({ n: sql<number>`count(*)::int` })
    .from(products)
    .where(where ?? sql`true`)
    .then((rows) => rows[0]?.n ?? 0);
}

export async function getExperienceStats(): Promise<ExperienceStats> {
  await ensureProductsSchemaUpToDate();
  const now = new Date();
  const periodStart = new Date(now.getTime() - 30 * DAY_MS);
  const priorPeriodStart = new Date(now.getTime() - 60 * DAY_MS);
  const inCurrent = gte(products.createdAt, periodStart);
  const inPrior = and(gte(products.createdAt, priorPeriodStart), lt(products.createdAt, periodStart));
  const isLive = eq(products.status, "live");
  const isDraft = eq(products.status, "draft");
  const isFeatured = eq(products.featured, true);

  const [
    totalAll,
    totalCurrent,
    totalPrior,
    publishedAll,
    publishedCurrent,
    publishedPrior,
    draftAll,
    draftCurrent,
    draftPrior,
    featuredAll,
    featuredCurrent,
    featuredPrior,
  ] = await Promise.all([
    countProducts(),
    countProducts(inCurrent),
    countProducts(inPrior),
    countProducts(isLive),
    countProducts(and(isLive, inCurrent)),
    countProducts(and(isLive, inPrior)),
    countProducts(isDraft),
    countProducts(and(isDraft, inCurrent)),
    countProducts(and(isDraft, inPrior)),
    countProducts(isFeatured),
    countProducts(and(isFeatured, inCurrent)),
    countProducts(and(isFeatured, inPrior)),
  ]);

  return {
    total: { value: totalAll, trendPct: pctChange(totalCurrent, totalPrior) },
    published: { value: publishedAll, trendPct: pctChange(publishedCurrent, publishedPrior) },
    draft: { value: draftAll, trendPct: pctChange(draftCurrent, draftPrior) },
    featured: { value: featuredAll, trendPct: pctChange(featuredCurrent, featuredPrior) },
  };
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export interface AdminProductListItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  status: ProductStatus;
  featured: boolean;
  categoryId: string;
  categoryName: string;
  supplierName: string;
  durationLabel: string;
  priceFromAmount: number;
  priceFromCurrency: string;
  image: { src: string; alt: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export type FeaturedFilter = "all" | "featured" | "not_featured";

export interface ListAdminProductsParams {
  q?: string;
  status?: ProductStatus | "all";
  categoryId?: string | "all";
  featured?: FeaturedFilter;
  page?: number;
  pageSize?: number;
}

export interface ListAdminProductsResult {
  items: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listAdminProducts(params: ListAdminProductsParams = {}): Promise<ListAdminProductsResult> {
  await ensureProductsSchemaUpToDate();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

  const conditions = [];
  if (params.status && params.status !== "all") {
    conditions.push(eq(products.status, params.status));
  }
  if (params.categoryId && params.categoryId !== "all") {
    conditions.push(eq(products.categoryId, params.categoryId));
  }
  if (params.featured === "featured") {
    conditions.push(eq(products.featured, true));
  } else if (params.featured === "not_featured") {
    conditions.push(eq(products.featured, false));
  }
  if (params.q && params.q.trim()) {
    const q = `%${params.q.trim()}%`;
    conditions.push(or(ilike(products.title, q), ilike(products.slug, q)));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(where ?? sql`true`);

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      shortDescription: products.shortDescription,
      status: products.status,
      featured: products.featured,
      categoryId: products.categoryId,
      durationLabel: products.durationLabel,
      priceFromAmount: products.priceFromAmount,
      priceFromCurrency: products.priceFromCurrency,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      supplierName: suppliers.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(suppliers, eq(products.supplierId, suppliers.id))
    .where(where ?? sql`true`)
    .orderBy(desc(products.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const ids = rows.map((r) => r.id);
  const images =
    ids.length > 0
      ? await db
          .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt })
          .from(productImages)
          .where(inArray(productImages.productId, ids))
          .orderBy(asc(productImages.sortOrder))
      : [];
  const imageByProduct = new Map<string, { src: string; alt: string }>();
  for (const img of images) {
    if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, { src: img.url, alt: img.alt });
  }

  const items: AdminProductListItem[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.shortDescription,
    status: r.status as ProductStatus,
    featured: r.featured,
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    supplierName: r.supplierName,
    durationLabel: r.durationLabel,
    priceFromAmount: r.priceFromAmount,
    priceFromCurrency: r.priceFromCurrency,
    image: imageByProduct.get(r.id) ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return { items, total: count, page, pageSize, totalPages: Math.max(1, Math.ceil(count / pageSize)) };
}

// ---------------------------------------------------------------------------
// Single record (full detail, every status — unlike the public getProductBySlug)
// ---------------------------------------------------------------------------

export interface AdminProductDetail {
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
  cancellationPolicy: string;
  categoryId: string;
  supplierId: string;
  status: ProductStatus;
  featured: boolean;
  featuredRank: number | null;
  durationLabel: string;
  priceFromAmount: number;
  priceFromCurrency: string;
  badges: string[];
  videoUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
  images: { id: string; url: string; alt: string }[];
  options: {
    id: string;
    name: string;
    description: string | null;
    priceAmount: number;
    priceCurrency: string;
    isActive: boolean;
  }[];
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  await ensureProductsSchemaUpToDate();
  const [row] = await db.select().from(products).where(eq(products.id, id));
  if (!row) return null;

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder));

  const options = await db
    .select()
    .from(productOptions)
    .where(eq(productOptions.productId, id))
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
    cancellationPolicy: row.cancellationPolicy,
    categoryId: row.categoryId,
    supplierId: row.supplierId,
    status: row.status as ProductStatus,
    featured: row.featured,
    featuredRank: row.featuredRank,
    durationLabel: row.durationLabel,
    priceFromAmount: row.priceFromAmount,
    priceFromCurrency: row.priceFromCurrency,
    badges: row.badges as string[],
    videoUrl: row.videoUrl,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    ogImage: row.ogImage,
    noIndex: row.noIndex,
    noFollow: row.noFollow,
    images: images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
    options: options.map((o) => ({
      id: o.id,
      name: o.name,
      description: o.description,
      priceAmount: o.priceAmount,
      priceCurrency: o.priceCurrency,
      isActive: o.isActive,
    })),
  };
}

// ---------------------------------------------------------------------------
// Category / supplier pickers — thin, admin-only lookups (no separate
// Supplier admin module exists yet, so this is a plain list, not a CRUD)
// ---------------------------------------------------------------------------

export async function getCategoryOptions(): Promise<{ id: string; name: string }[]> {
  return db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name));
}

export async function getSupplierOptions(): Promise<{ id: string; name: string }[]> {
  return db.select({ id: suppliers.id, name: suppliers.name }).from(suppliers).orderBy(asc(suppliers.name));
}

// ---------------------------------------------------------------------------
// Create / update / delete
// ---------------------------------------------------------------------------

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const rows = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug));
  return rows.some((r) => r.id !== excludeId);
}

function baseProductValues(input: ProductFormData) {
  return {
    slug: input.slug,
    title: input.title,
    shortDescription: input.shortDescription,
    description: input.description,
    highlights: input.highlights,
    inclusions: input.inclusions,
    exclusions: input.exclusions,
    meetingPoint: input.meetingPoint || null,
    meetingCity: input.meetingCity || null,
    meetingCountry: input.meetingCountry || null,
    cancellationPolicy: input.cancellationPolicy,
    categoryId: input.categoryId,
    supplierId: input.supplierId,
    status: input.status,
    featured: input.featured,
    featuredRank: input.featuredRank ?? null,
    durationLabel: input.durationLabel,
    priceFromAmount: input.priceFromAmount,
    priceFromCurrency: input.priceFromCurrency,
    badges: input.badges,
    videoUrl: input.videoUrl || null,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    ogImage: input.ogImage || null,
    noIndex: input.noIndex,
    noFollow: input.noFollow,
  };
}

/**
 * Images have no incoming FK from anywhere else, so a delete-all,
 * re-insert-in-form-order is simple and safe.
 */
async function replaceImages(productId: string, images: ProductFormData["images"]) {
  await db.delete(productImages).where(eq(productImages.productId, productId));
  if (images.length > 0) {
    await db.insert(productImages).values(
      images.map((img, index) => ({ productId, url: img.url, alt: img.alt, sortOrder: index })),
    );
  }
}

/**
 * Options ARE referenced by cart_items.productOptionId with no cascade
 * (by design — an in-progress cart should never silently lose its line
 * item). So instead of delete-all/re-insert, this diffs against the
 * existing rows: updates matches by id, inserts new (id-less) rows, and
 * soft-hides (isActive: false) any existing row the admin removed from
 * the form rather than hard-deleting it.
 */
async function syncOptions(productId: string, submitted: ProductFormData["options"]) {
  const existing = await db
    .select({ id: productOptions.id })
    .from(productOptions)
    .where(eq(productOptions.productId, productId));
  const existingIds = new Set(existing.map((r) => r.id));
  const submittedIds = new Set(submitted.filter((o) => o.id).map((o) => o.id as string));

  const removedIds = [...existingIds].filter((id) => !submittedIds.has(id));
  if (removedIds.length > 0) {
    await db.update(productOptions).set({ isActive: false }).where(inArray(productOptions.id, removedIds));
  }

  for (let index = 0; index < submitted.length; index++) {
    const opt = submitted[index];
    if (opt.id && existingIds.has(opt.id)) {
      await db
        .update(productOptions)
        .set({
          name: opt.name,
          description: opt.description || null,
          priceAmount: opt.priceAmount,
          priceCurrency: opt.priceCurrency,
          sortOrder: index,
          isActive: opt.isActive,
        })
        .where(eq(productOptions.id, opt.id));
    } else {
      await db.insert(productOptions).values({
        productId,
        name: opt.name,
        description: opt.description || null,
        priceAmount: opt.priceAmount,
        priceCurrency: opt.priceCurrency,
        sortOrder: index,
        isActive: opt.isActive,
      });
    }
  }
}

export async function createProduct(input: ProductFormData): Promise<MutationResult> {
  await ensureProductsSchemaUpToDate();
  if (await slugTaken(input.slug)) {
    return { success: false, error: "That slug is already used by another experience." };
  }
  try {
    const [row] = await db.insert(products).values(baseProductValues(input)).returning({ id: products.id });
    await replaceImages(row.id, input.images);
    await syncOptions(row.id, input.options);
    return { success: true, id: row.id };
  } catch (err) {
    console.error("[admin/products] createProduct failed:", err);
    return { success: false, error: "Could not create the experience. Please try again." };
  }
}

export async function updateProduct(id: string, input: ProductFormData): Promise<MutationResult> {
  await ensureProductsSchemaUpToDate();
  if (await slugTaken(input.slug, id)) {
    return { success: false, error: "That slug is already used by another experience." };
  }
  try {
    await db
      .update(products)
      .set({ ...baseProductValues(input), updatedAt: new Date() })
      .where(eq(products.id, id));
    await replaceImages(id, input.images);
    await syncOptions(id, input.options);
    return { success: true, id };
  } catch (err) {
    console.error("[admin/products] updateProduct failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}

export async function deleteProduct(id: string): Promise<MutationResult> {
  try {
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  } catch (err) {
    // Postgres foreign_key_violation — this product has real order_items
    // or cart_items pointing at it (no cascade there, on purpose: order
    // history and active carts must never silently vanish).
    const code = (err as { code?: string } | null)?.code;
    if (code === "23503") {
      return {
        success: false,
        error: "This experience has existing bookings or is in a customer's cart, so it can't be deleted — set it to Paused instead.",
      };
    }
    console.error("[admin/products] deleteProduct failed:", err);
    return { success: false, error: "Could not delete the experience. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Quick actions (list-view inline toggles)
// ---------------------------------------------------------------------------

export async function setProductStatus(id: string, status: ProductStatus): Promise<MutationResult> {
  try {
    await db.update(products).set({ status, updatedAt: new Date() }).where(eq(products.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/products] setProductStatus failed:", err);
    return { success: false, error: "Could not update status." };
  }
}

export async function setProductFeatured(id: string, featured: boolean): Promise<MutationResult> {
  try {
    await db.update(products).set({ featured, updatedAt: new Date() }).where(eq(products.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/products] setProductFeatured failed:", err);
    return { success: false, error: "Could not update featured status." };
  }
}

// ---------------------------------------------------------------------------
// Bulk actions (list-view multi-select bar)
// ---------------------------------------------------------------------------

export async function bulkSetProductStatus(ids: string[], status: ProductStatus): Promise<MutationResult> {
  if (ids.length === 0) return { success: true };
  try {
    await db.update(products).set({ status, updatedAt: new Date() }).where(inArray(products.id, ids));
    return { success: true };
  } catch (err) {
    console.error("[admin/products] bulkSetProductStatus failed:", err);
    return { success: false, error: "Could not update status for the selected experiences." };
  }
}

export async function bulkSetProductFeatured(ids: string[], featured: boolean): Promise<MutationResult> {
  if (ids.length === 0) return { success: true };
  try {
    await db.update(products).set({ featured, updatedAt: new Date() }).where(inArray(products.id, ids));
    return { success: true };
  } catch (err) {
    console.error("[admin/products] bulkSetProductFeatured failed:", err);
    return { success: false, error: "Could not update featured status for the selected experiences." };
  }
}

export interface BulkDeleteResult {
  success: boolean;
  deletedCount: number;
  blockedCount: number;
  error?: string;
}

/**
 * Looped rather than a single batched DELETE ... WHERE id IN (...) so
 * that one product with real bookings (FK violation, code 23503) blocks
 * only itself — the rest of the selection still gets deleted — and so
 * the admin gets an honest count of what succeeded vs. what's blocked.
 */
export async function bulkDeleteProducts(ids: string[]): Promise<BulkDeleteResult> {
  let deletedCount = 0;
  let blockedCount = 0;
  for (const id of ids) {
    const result = await deleteProduct(id);
    if (result.success) deletedCount++;
    else blockedCount++;
  }
  return {
    success: blockedCount === 0,
    deletedCount,
    blockedCount,
    error:
      blockedCount > 0
        ? `${blockedCount} experience${blockedCount === 1 ? "" : "s"} could not be deleted because ${
            blockedCount === 1 ? "it has" : "they have"
          } existing bookings — set ${blockedCount === 1 ? "it" : "them"} to Paused instead.`
        : undefined,
  };
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export { getProductAvailability as getAdminProductAvailability };

/**
 * Idempotent bulk-generate: inserts the next `days` dates at
 * `capacityTotal`, or, for a date that already has a row, raises its
 * capacity to at least `capacityTotal` — GREATEST() guarantees this
 * never drops a date's capacity below what's already booked.
 */
export async function generateAvailability(
  productId: string,
  days: number,
  capacityTotal: number,
): Promise<MutationResult> {
  try {
    const today = new Date();
    const rows: { productId: string; date: string; capacityTotal: number }[] = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      rows.push({ productId, date: date.toISOString().slice(0, 10), capacityTotal });
    }
    await db
      .insert(availability)
      .values(rows)
      .onConflictDoUpdate({
        target: [availability.productId, availability.date],
        set: { capacityTotal: sql`GREATEST(${availability.capacityBooked}, ${capacityTotal})`, updatedAt: new Date() },
      });
    return { success: true };
  } catch (err) {
    console.error("[admin/products] generateAvailability failed:", err);
    return { success: false, error: "Could not generate availability." };
  }
}

export async function updateAvailabilityCapacity(
  productId: string,
  date: string,
  capacityTotal: number,
): Promise<MutationResult> {
  try {
    await db
      .update(availability)
      .set({ capacityTotal: sql`GREATEST(${capacityTotal}, ${availability.capacityBooked})`, updatedAt: new Date() })
      .where(and(eq(availability.productId, productId), eq(availability.date, date)));
    return { success: true };
  } catch (err) {
    console.error("[admin/products] updateAvailabilityCapacity failed:", err);
    return { success: false, error: "Could not update capacity." };
  }
}

export async function deleteAvailabilityDate(productId: string, date: string): Promise<MutationResult> {
  try {
    const result = await db
      .delete(availability)
      .where(
        and(
          eq(availability.productId, productId),
          eq(availability.date, date),
          eq(availability.capacityBooked, 0),
        ),
      );
    const count = (result as { rowCount?: number | null }).rowCount ?? 0;
    if (count === 0) {
      return { success: false, error: "This date has existing bookings and can't be removed." };
    }
    return { success: true };
  } catch (err) {
    console.error("[admin/products] deleteAvailabilityDate failed:", err);
    return { success: false, error: "Could not remove that date." };
  }
}
