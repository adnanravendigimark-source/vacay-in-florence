import "server-only";
import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, orderItems, orders, productImages, products, users } from "@/lib/db/schema";

const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  pending_payment: "Pending payment",
  cancelled: "Cancelled",
  failed: "Failed",
};

const FALLBACK_IMAGE = { src: "/images/florence-hero.jpg", alt: "Florence, Italy" };

/**
 * Percentage change vs. the prior period. Returns null (rather than a
 * fake/misleading Infinity% or 0%) whenever the prior period has zero to
 * compare against — a real, honest "not enough history yet" case rather
 * than a fabricated trend.
 */
export function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export interface DashboardStat {
  value: number;
  trendPct: number | null;
}

export interface RecentOrderRow {
  id: string;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  extraItemCount: number;
  image: { src: string; alt: string };
  participantCount: number;
  status: string;
  statusLabel: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
}

export interface RecentActivityRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorName: string | null;
  createdAt: Date;
}

export interface DashboardData {
  bookings: DashboardStat;
  revenue: DashboardStat;
  customers: DashboardStat;
  totalExperiences: number;
  bookingsByStatus: { status: string; label: string; count: number }[];
  recentOrders: RecentOrderRow[];
  recentActivity: RecentActivityRow[];
}

/**
 * All real aggregate queries for the admin dashboard — no placeholder or
 * hardcoded numbers. Run in parallel since none depend on each other.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const periodStart = new Date(now.getTime() - 30 * DAY_MS);
  const priorPeriodStart = new Date(now.getTime() - 60 * DAY_MS);

  const [
    bookingsTotalRow,
    bookingsCurrentRow,
    bookingsPriorRow,
    revenueCurrentRow,
    revenuePriorRow,
    customersTotalRow,
    customersCurrentRow,
    customersPriorRow,
    experiencesRow,
    statusRows,
    recentOrdersBase,
    recentActivityBase,
  ] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(orders),
    db.select({ n: sql<number>`count(*)::int` }).from(orders).where(gte(orders.createdAt, periodStart)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(gte(orders.createdAt, priorPeriodStart), lt(orders.createdAt, periodStart))),
    db
      .select({ n: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::float` })
      .from(orders)
      .where(and(eq(orders.status, "confirmed"), gte(orders.createdAt, periodStart))),
    db
      .select({ n: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::float` })
      .from(orders)
      .where(
        and(eq(orders.status, "confirmed"), gte(orders.createdAt, priorPeriodStart), lt(orders.createdAt, periodStart)),
      ),
    db.select({ n: sql<number>`count(*)::int` }).from(users).where(sql`${users.roleId} is null`),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(users)
      .where(and(sql`${users.roleId} is null`, gte(users.createdAt, periodStart))),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(sql`${users.roleId} is null`, gte(users.createdAt, priorPeriodStart), lt(users.createdAt, periodStart)),
      ),
    db.select({ n: sql<number>`count(*)::int` }).from(products),
    db.select({ status: orders.status, n: sql<number>`count(*)::int` }).from(orders).groupBy(orders.status),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        createdAt: auditLogs.createdAt,
        actorName: users.name,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorUserId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(6),
  ]);

  // Revenue for the "vs. previous 30 days" trend is scoped to confirmed
  // orders within each window; the all-time total the card displays is a
  // separate, unscoped-by-date sum of all confirmed orders.
  const [revenueTotalRow] = await db
    .select({ n: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::float` })
    .from(orders)
    .where(eq(orders.status, "confirmed"));

  const bookingsByStatus = statusRows
    .map((r) => ({ status: r.status, label: STATUS_LABEL[r.status] ?? r.status, count: r.n }))
    .sort((a, b) => b.count - a.count);

  // Recent orders: batch-resolve each order's first item (title + image)
  // and total participant count, the same batched-join pattern used in
  // src/lib/data/orders.ts — never a query per row.
  const orderIds = recentOrdersBase.map((o) => o.id);
  const itemRows = orderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
    : [];

  const itemsByOrder = new Map<string, typeof itemRows>();
  for (const row of itemRows) {
    const list = itemsByOrder.get(row.orderId) ?? [];
    list.push(row);
    itemsByOrder.set(row.orderId, list);
  }

  const productIds = Array.from(new Set(itemRows.map((r) => r.productId)));
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

  const recentOrders: RecentOrderRow[] = recentOrdersBase.map((order) => {
    const items = itemsByOrder.get(order.id) ?? [];
    const firstItem = items[0];
    const image = firstItem ? imageByProduct.get(firstItem.productId) : undefined;
    const participantCount = items.reduce(
      (sum, item) => sum + item.participants.reduce((s, p) => s + (p.quantity || 0), 0),
      0,
    );
    return {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      productTitle: firstItem?.productTitle ?? "Booking",
      extraItemCount: Math.max(0, items.length - 1),
      image: image ? { src: image.url, alt: image.alt } : { ...FALLBACK_IMAGE, alt: firstItem?.productTitle ?? "Booking" },
      participantCount,
      status: order.status,
      statusLabel: STATUS_LABEL[order.status] ?? order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      createdAt: order.createdAt,
    };
  });

  const recentActivity: RecentActivityRow[] = recentActivityBase.map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    actorName: row.actorName,
    createdAt: row.createdAt,
  }));

  return {
    bookings: {
      value: bookingsTotalRow[0]?.n ?? 0,
      trendPct: pctChange(bookingsCurrentRow[0]?.n ?? 0, bookingsPriorRow[0]?.n ?? 0),
    },
    revenue: {
      value: revenueTotalRow?.n ?? 0,
      trendPct: pctChange(revenueCurrentRow[0]?.n ?? 0, revenuePriorRow[0]?.n ?? 0),
    },
    customers: {
      value: customersTotalRow[0]?.n ?? 0,
      trendPct: pctChange(customersCurrentRow[0]?.n ?? 0, customersPriorRow[0]?.n ?? 0),
    },
    totalExperiences: experiencesRow[0]?.n ?? 0,
    bookingsByStatus,
    recentOrders,
    recentActivity,
  };
}
