import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";

export interface OrderItemView {
  id: string;
  productId: string;
  productTitle: string;
  date: string;
  participants: { optionId: string; optionName: string; quantity: number; unitPriceAmount: number }[];
  subtotalAmount: number;
  currency: string;
}

export interface OrderView {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  createdAt: Date;
  items: OrderItemView[];
}

function toItemView(row: {
  id: string;
  productId: string;
  productTitle: string;
  date: string;
  participants: unknown;
  subtotalAmount: number;
  currency: string;
}): OrderItemView {
  return {
    id: row.id,
    productId: row.productId,
    productTitle: row.productTitle,
    date: row.date,
    participants: row.participants as OrderItemView["participants"],
    subtotalAmount: row.subtotalAmount,
    currency: row.currency,
  };
}

/** Scoped to `userId` — an order id alone is never enough to view someone else's booking. */
export async function getOrderForUser(orderId: string, userId: string): Promise<OrderView | null> {
  const order = db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).get();
  if (!order) return null;

  const items = db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).all();

  return {
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    notes: order.notes,
    createdAt: order.createdAt,
    items: items.map(toItemView),
  };
}

export async function getOrdersForUser(userId: string): Promise<OrderView[]> {
  const rows = db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)).all();
  if (rows.length === 0) return [];

  // One batched WHERE-IN for every order's items — never N+1, never the
  // whole order_items table.
  const orderIds = rows.map((r) => r.id);
  const items = db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)).all();
  const itemsByOrder = new Map<string, OrderItemView[]>();
  for (const item of items) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(toItemView(item));
    itemsByOrder.set(item.orderId, list);
  }

  return rows.map((order) => ({
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    notes: order.notes,
    createdAt: order.createdAt,
    items: itemsByOrder.get(order.id) ?? [],
  }));
}
