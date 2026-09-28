import "server-only";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products, productImages } from "@/lib/db/schema";
import type { OrderStatus } from "@/lib/data/admin/booking-status";

export type { OrderStatus } from "@/lib/data/admin/booking-status";
export { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/lib/data/admin/booking-status";

export interface MutationResult {
  success: boolean;
  error?: string;
}

export interface AdminOrderListItem {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  productTitle: string;
  extraItemCount: number;
  itemCount: number;
  createdAt: Date;
}

export interface AdminOrderItemView {
  id: string;
  productId: string;
  productSlug: string | null;
  productTitle: string;
  date: string;
  participants: { optionId: string; optionName: string; quantity: number; unitPriceAmount: number }[];
  subtotalAmount: number;
  currency: string;
  image: { src: string; alt: string };
}

export interface AdminOrderDetail {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: AdminOrderItemView[];
}

const FALLBACK_IMAGE = { src: "/images/florence-hero.jpg", alt: "Florence, Italy" };

export interface AdminOrderFilters {
  status?: OrderStatus;
  /** Matches against customer name or email (case-insensitive substring). */
  search?: string;
}

/**
 * Every order, newest first, with each row's first booked item resolved
 * for display — same batched-join pattern as src/lib/data/orders.ts and
 * the dashboard's recent-orders query, never a query per row. Status/
 * search filtering happens in SQL so a large order history never has to
 * be pulled into memory just to be filtered.
 */
export async function listAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrderListItem[]> {
  const conditions = [];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(or(like(orders.customerName, term), like(orders.customerEmail, term)));
  }

  const rows = await db
    .select()
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  if (rows.length === 0) return [];

  const orderIds = rows.map((r) => r.id);
  const itemRows = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
  const itemsByOrder = new Map<string, typeof itemRows>();
  for (const row of itemRows) {
    const list = itemsByOrder.get(row.orderId) ?? [];
    list.push(row);
    itemsByOrder.set(row.orderId, list);
  }

  return rows.map((order) => {
    const items = itemsByOrder.get(order.id) ?? [];
    const firstItem = items[0];
    return {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status as OrderStatus,
      totalAmount: order.totalAmount,
      currency: order.currency,
      productTitle: firstItem?.productTitle ?? "Booking",
      extraItemCount: Math.max(0, items.length - 1),
      itemCount: items.length,
      createdAt: order.createdAt,
    };
  });
}

/**
 * Counts by status for the list page's filter pills — a single grouped
 * query rather than one count() per status.
 */
export async function countAdminOrdersByStatus(): Promise<Record<string, number>> {
  const rows = await db.select({ status: orders.status, n: sql<number>`count(*)::int` }).from(orders).groupBy(orders.status);
  const out: Record<string, number> = {};
  for (const r of rows) out[r.status] = r.n;
  return out;
}

/** Not scoped to a userId — an admin can view any customer's order. */
export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;

  const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const productIds = Array.from(new Set(itemRows.map((r) => r.productId)));

  const productRows = productIds.length
    ? await db.select({ id: products.id, slug: products.slug }).from(products).where(inArray(products.id, productIds))
    : [];
  const slugById = new Map(productRows.map((p) => [p.id, p.slug]));

  const imageRows = productIds.length
    ? await db
        .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(productImages.sortOrder)
    : [];
  const imageByProduct = new Map<string, { url: string; alt: string }>();
  for (const img of imageRows) {
    if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img);
  }

  const items: AdminOrderItemView[] = itemRows.map((row) => {
    const image = imageByProduct.get(row.productId);
    return {
      id: row.id,
      productId: row.productId,
      productSlug: slugById.get(row.productId) ?? null,
      productTitle: row.productTitle,
      date: row.date,
      participants: row.participants as AdminOrderItemView["participants"],
      subtotalAmount: row.subtotalAmount,
      currency: row.currency,
      image: image ? { src: image.url, alt: image.alt } : { ...FALLBACK_IMAGE, alt: row.productTitle },
    };
  });

  return {
    id: order.id,
    userId: order.userId,
    status: order.status as OrderStatus,
    totalAmount: order.totalAmount,
    currency: order.currency,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items,
  };
}

/**
 * Manual status override — the site has no payment processor wired up
 * (see the Master Admin Panel plan), so this is the only place an
 * order's status ever changes after checkout creates it as
 * "pending_payment". Honest and explicit rather than faking a payment
 * confirmation flow.
 */
export async function setOrderStatus(id: string, status: OrderStatus): Promise<MutationResult> {
  try {
    await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/bookings] setOrderStatus failed:", err);
    return { success: false, error: "Could not update the booking's status." };
  }
}
