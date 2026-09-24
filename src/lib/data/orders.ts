import { eq, and, desc, inArray, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products, productImages } from "@/lib/db/schema";

export interface OrderItemView {
  id: string;
  productId: string;
  productSlug: string | null;
  productTitle: string;
  date: string;
  participants: { optionId: string; optionName: string; quantity: number; unitPriceAmount: number }[];
  subtotalAmount: number;
  currency: string;
  // Resolved from the live product (not stored on the order item itself)
  // for display — the same batched-join pattern src/lib/data/cart.ts
  // uses, never per-item queries. Falls back to a generic site image /
  // "Florence, Italy" only when the product (or its image/location) is
  // missing, never to a specific but wrong guess.
  image: { src: string; alt: string };
  location: string;
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

type ItemRow = {
  id: string;
  productId: string;
  productTitle: string;
  date: string;
  participants: unknown;
  subtotalAmount: number;
  currency: string;
};

type ProductLookup = {
  slug: string;
  meetingCity: string | null;
  meetingCountry: string | null;
};

const FALLBACK_IMAGE = { src: "/images/florence-hero.jpg", alt: "Florence, Italy" };

/**
 * Batches the product + image lookups for a set of order items — one
 * WHERE-IN for product location/slug, one WHERE-IN for the first image
 * per product — instead of a query per item.
 */
async function resolveItemViews(rows: ItemRow[]): Promise<OrderItemView[]> {
  if (rows.length === 0) return [];

  const productIds = Array.from(new Set(rows.map((r) => r.productId)));

  const productRows = await db
    .select({
      id: products.id,
      slug: products.slug,
      meetingCity: products.meetingCity,
      meetingCountry: products.meetingCountry,
    })
    .from(products)
    .where(inArray(products.id, productIds));
  const productById = new Map<string, ProductLookup>(
    productRows.map((p) => [p.id, { slug: p.slug, meetingCity: p.meetingCity, meetingCountry: p.meetingCountry }]),
  );

  const imageRows = await db
    .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.sortOrder));
  const imageByProduct = new Map<string, { url: string; alt: string }>();
  for (const img of imageRows) {
    if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img);
  }

  return rows.map((row) => {
    const product = productById.get(row.productId);
    const image = imageByProduct.get(row.productId);
    const location = [product?.meetingCity, product?.meetingCountry].filter(Boolean).join(", ") || "Florence, Italy";
    return {
      id: row.id,
      productId: row.productId,
      productSlug: product?.slug ?? null,
      productTitle: row.productTitle,
      date: row.date,
      participants: row.participants as OrderItemView["participants"],
      subtotalAmount: row.subtotalAmount,
      currency: row.currency,
      image: image ? { src: image.url, alt: image.alt } : { ...FALLBACK_IMAGE, alt: row.productTitle },
      location,
    };
  });
}

/** Scoped to `userId` — an order id alone is never enough to view someone else's booking. */
export async function getOrderForUser(orderId: string, userId: string): Promise<OrderView | null> {
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
  if (!order) return null;

  const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

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
    items: await resolveItemViews(itemRows),
  };
}

export async function getOrdersForUser(userId: string): Promise<OrderView[]> {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  if (rows.length === 0) return [];

  // One batched WHERE-IN for every order's items — never N+1, never the
  // whole order_items table.
  const orderIds = rows.map((r) => r.id);
  const itemRows = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
  // resolveItemViews returns one resolved view per input row, same order
  // — zip back against itemRows (which still has orderId) by index rather
  // than re-deriving it, since OrderItemView itself has no orderId field.
  const itemViews = await resolveItemViews(itemRows);
  const itemsByOrder = new Map<string, OrderItemView[]>();
  itemRows.forEach((row, i) => {
    const list = itemsByOrder.get(row.orderId) ?? [];
    list.push(itemViews[i]);
    itemsByOrder.set(row.orderId, list);
  });

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
