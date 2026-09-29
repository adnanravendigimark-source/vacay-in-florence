import "server-only";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products, supplierPayouts, supplierPayoutItems } from "@/lib/db/schema";
import { getEffectiveCommissionRate } from "./commission";

export interface SupplierFinancialsSummary {
  totalSales: number;
  totalEarnings: number;
  totalPaidOut: number;
  pendingPayout: number;
  commissionRate: number;
  currency: string;
}

export interface SupplierPendingOrderItem {
  orderItemId: string;
  orderId: string;
  productTitle: string;
  date: string;
  customerName: string;
  subtotalAmount: number;
  earnedAmount: number;
  currency: string;
  createdAt: Date;
}

export interface SupplierPayoutHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface SupplierFinancials {
  summary: SupplierFinancialsSummary;
  pendingItems: SupplierPendingOrderItem[];
  payoutHistory: SupplierPayoutHistoryItem[];
}

/**
 * Every figure here is computed at query time from confirmed orders and
 * recorded payouts — never stored redundantly, so there's no sync-drift
 * bug class (see the plan's schema note on supplierPayoutItems). "Pending"
 * is exactly: confirmed order items for this supplier that are NOT YET
 * linked into any supplierPayouts batch (the unique index on
 * supplier_payout_items.order_item_id is what guarantees an item can only
 * ever be paid out once).
 */
export async function getSupplierFinancials(supplierId: string): Promise<SupplierFinancials> {
  const commissionRate = await getEffectiveCommissionRate(supplierId);

  const [salesAgg] = await db
    .select({ total: sql<number>`coalesce(sum(${orderItems.subtotalAmount}), 0)` })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(and(eq(products.supplierId, supplierId), eq(orders.status, "confirmed")));

  const [paidAgg] = await db
    .select({ total: sql<number>`coalesce(sum(${supplierPayouts.amount}), 0)` })
    .from(supplierPayouts)
    .where(and(eq(supplierPayouts.supplierId, supplierId), eq(supplierPayouts.status, "paid")));

  const pendingRows = await db
    .select({
      orderItemId: orderItems.id,
      orderId: orderItems.orderId,
      productTitle: orderItems.productTitle,
      date: orderItems.date,
      customerName: orders.customerName,
      subtotalAmount: orderItems.subtotalAmount,
      currency: orderItems.currency,
      createdAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(supplierPayoutItems, eq(supplierPayoutItems.orderItemId, orderItems.id))
    .where(and(eq(products.supplierId, supplierId), eq(orders.status, "confirmed"), isNull(supplierPayoutItems.id)))
    .orderBy(desc(orders.createdAt));

  const pendingItems: SupplierPendingOrderItem[] = pendingRows.map((r) => ({
    ...r,
    earnedAmount: Math.round(r.subtotalAmount * (1 - commissionRate) * 100) / 100,
  }));
  const pendingPayout = Math.round(pendingItems.reduce((sum, i) => sum + i.earnedAmount, 0) * 100) / 100;

  const payoutHistory = await db
    .select()
    .from(supplierPayouts)
    .where(eq(supplierPayouts.supplierId, supplierId))
    .orderBy(desc(supplierPayouts.createdAt));

  const totalSales = salesAgg?.total ?? 0;

  return {
    summary: {
      totalSales,
      totalEarnings: Math.round(totalSales * (1 - commissionRate) * 100) / 100,
      totalPaidOut: paidAgg?.total ?? 0,
      pendingPayout,
      commissionRate,
      currency: "EUR",
    },
    pendingItems,
    payoutHistory,
  };
}
