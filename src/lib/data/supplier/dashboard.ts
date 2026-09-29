import "server-only";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, orders, orderItems } from "@/lib/db/schema";
import { getEffectiveCommissionRate } from "./commission";

export interface SupplierDashboardBooking {
  orderId: string;
  productTitle: string;
  date: string;
  customerName: string;
  status: string;
  subtotalAmount: number;
  currency: string;
}

export interface SupplierDashboardExperience {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
}

export interface SupplierDashboardData {
  totalExperiences: number;
  publishedExperiences: number;
  pendingExperiences: number;
  totalBookings: number;
  upcomingBookings: number;
  totalRevenue: number;
  estimatedEarnings: number;
  commissionRate: number;
  currency: string;
  recentBookings: SupplierDashboardBooking[];
  recentExperiences: SupplierDashboardExperience[];
}

/**
 * Every figure here is computed fresh from `products`/`orders`/`order_items`
 * scoped to this one supplier — no cached or hardcoded numbers. Mirrors the
 * admin dashboard's aggregate-query shape (src/lib/data/admin/dashboard.ts)
 * but scoped by `products.supplierId`, which is the sole authorization
 * boundary for every supplier-facing query in this app (see require-user.ts
 * for the session-level boundary that gets a supplier here in the first
 * place).
 */
export async function getSupplierDashboardData(supplierId: string): Promise<SupplierDashboardData> {
  const [experienceCounts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${products.status} = 'live')::int`,
      pending: sql<number>`count(*) filter (where ${products.status} = 'pending_review')::int`,
    })
    .from(products)
    .where(eq(products.supplierId, supplierId));

  const todayStr = new Date().toISOString().slice(0, 10);

  const [bookingAgg] = await db
    .select({
      totalBookings: sql<number>`count(*)::int`,
      upcomingBookings: sql<number>`count(*) filter (where ${orderItems.date} >= ${todayStr} and ${orders.status} = 'confirmed')::int`,
      totalRevenue: sql<number>`coalesce(sum(${orderItems.subtotalAmount}) filter (where ${orders.status} = 'confirmed'), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(products.supplierId, supplierId));

  const recentBookingRows = await db
    .select({
      orderId: orders.id,
      productTitle: orderItems.productTitle,
      date: orderItems.date,
      customerName: orders.customerName,
      status: orders.status,
      subtotalAmount: orderItems.subtotalAmount,
      currency: orderItems.currency,
      createdAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(products.supplierId, supplierId))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const recentExperienceRows = await db
    .select({ id: products.id, title: products.title, status: products.status, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.supplierId, supplierId))
    .orderBy(desc(products.updatedAt))
    .limit(5);

  const commissionRate = await getEffectiveCommissionRate(supplierId);
  const totalRevenue = bookingAgg?.totalRevenue ?? 0;

  return {
    totalExperiences: experienceCounts?.total ?? 0,
    publishedExperiences: experienceCounts?.published ?? 0,
    pendingExperiences: experienceCounts?.pending ?? 0,
    totalBookings: bookingAgg?.totalBookings ?? 0,
    upcomingBookings: bookingAgg?.upcomingBookings ?? 0,
    totalRevenue,
    estimatedEarnings: Math.round(totalRevenue * (1 - commissionRate) * 100) / 100,
    commissionRate,
    currency: "EUR",
    recentBookings: recentBookingRows.map((r) => ({
      orderId: r.orderId,
      productTitle: r.productTitle,
      date: r.date,
      customerName: r.customerName,
      status: r.status,
      subtotalAmount: r.subtotalAmount,
      currency: r.currency,
    })),
    recentExperiences: recentExperienceRows,
  };
}
