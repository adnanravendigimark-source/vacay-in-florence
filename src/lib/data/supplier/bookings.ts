import "server-only";
import { eq, desc, and, or, like, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import type { OrderStatus } from "@/lib/data/admin/booking-status";

export interface SupplierBookingParticipant {
  optionId: string;
  optionName: string;
  quantity: number;
  unitPriceAmount: number;
}

export interface SupplierBookingListItem {
  /** orderItems.id — the supplier-scoped booking unit. An order can span
   * multiple suppliers, so a supplier only ever sees their own line items,
   * never the rest of someone else's order. */
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  date: string;
  participants: SupplierBookingParticipant[];
  subtotalAmount: number;
  currency: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  createdAt: Date;
}

export interface SupplierBookingFilters {
  status?: OrderStatus;
  search?: string;
}

/**
 * Extends the same orderItems -> orders join the admin bookings module
 * already uses (src/lib/data/admin/bookings.ts), with a mandatory
 * `products.supplierId = :supplierId` — the actual authorization boundary
 * for every booking a supplier can see. Only customer name/email are
 * surfaced here (phone/notes are in the detail view below), matching what
 * any real marketplace shows a seller about who booked them.
 */
export async function listSupplierBookings(
  supplierId: string,
  filters: SupplierBookingFilters = {},
): Promise<SupplierBookingListItem[]> {
  const conditions: SQL[] = [eq(products.supplierId, supplierId)];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    const searchCondition = or(like(orders.customerName, term), like(orders.customerEmail, term));
    if (searchCondition) conditions.push(searchCondition);
  }

  const rows = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      productTitle: orderItems.productTitle,
      date: orderItems.date,
      participants: orderItems.participants,
      subtotalAmount: orderItems.subtotalAmount,
      currency: orderItems.currency,
      status: orders.status,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      createdAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(300);

  return rows.map((r) => ({
    ...r,
    participants: r.participants as SupplierBookingParticipant[],
    status: r.status as OrderStatus,
  }));
}

export interface SupplierBookingDetail extends SupplierBookingListItem {
  customerPhone: string | null;
  notes: string | null;
}

/**
 * Ownership-checked single-booking read: returns null (never partial data)
 * unless this exact order item belongs to a product owned by `supplierId`
 * — the same boundary a guessed/enumerated id has to pass at every other
 * supplier-facing read in this app.
 */
export async function getSupplierBooking(orderItemId: string, supplierId: string): Promise<SupplierBookingDetail | null> {
  const [row] = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      productTitle: orderItems.productTitle,
      date: orderItems.date,
      participants: orderItems.participants,
      subtotalAmount: orderItems.subtotalAmount,
      currency: orderItems.currency,
      status: orders.status,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      notes: orders.notes,
      createdAt: orders.createdAt,
      ownerSupplierId: products.supplierId,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.id, orderItemId));

  if (!row || row.ownerSupplierId !== supplierId) return null;

  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    productTitle: row.productTitle,
    date: row.date,
    participants: row.participants as SupplierBookingParticipant[],
    subtotalAmount: row.subtotalAmount,
    currency: row.currency,
    status: row.status as OrderStatus,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}
