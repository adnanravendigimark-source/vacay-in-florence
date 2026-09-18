import { eq, inArray, asc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, products, productImages, productOptions } from "@/lib/db/schema";
import { getCartId } from "@/lib/cart";

export interface CartLineItem {
  id: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  image: { src: string; alt: string };
  date: string;
  participants: { optionId: string; optionName: string; quantity: number; unitPriceAmount: number }[];
  subtotalAmount: number;
  currency: string;
  // Every active option for this product (not just the ones currently
  // selected), so the cart page can offer "add another option type"
  // rather than only edit/remove what's already there.
  availableOptions: { id: string; name: string; priceAmount: number }[];
}

export interface CartSummary {
  items: CartLineItem[];
  totalAmount: number;
  totalParticipants: number;
  currency: string;
}

/**
 * Reads the current visitor's cart (from the cart-id cookie) joined with
 * enough product data to render it — one query for the cart_items +
 * products join, one batched WHERE-IN query for images, never N+1.
 */
export async function getCartSummary(): Promise<CartSummary> {
  const cartId = await getCartId();
  if (!cartId) {
    return { items: [], totalAmount: 0, totalParticipants: 0, currency: "EUR" };
  }

  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      productSlug: products.slug,
      productTitle: products.title,
      date: cartItems.date,
      participants: cartItems.participants,
      subtotalAmount: cartItems.subtotalAmount,
      currency: cartItems.currency,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.createdAt));

  if (rows.length === 0) {
    return { items: [], totalAmount: 0, totalParticipants: 0, currency: "EUR" };
  }

  const productIds = Array.from(new Set(rows.map((r) => r.productId)));
  const images = await db
    .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.sortOrder));
  const imageByProduct = new Map<string, { url: string; alt: string }>();
  for (const img of images) {
    if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img);
  }

  const options = await db
    .select({ id: productOptions.id, productId: productOptions.productId, name: productOptions.name, priceAmount: productOptions.priceAmount })
    .from(productOptions)
    .where(and(inArray(productOptions.productId, productIds), eq(productOptions.isActive, true)));
  const optionsByProduct = new Map<string, { id: string; name: string; priceAmount: number }[]>();
  for (const opt of options) {
    const list = optionsByProduct.get(opt.productId) ?? [];
    list.push({ id: opt.id, name: opt.name, priceAmount: opt.priceAmount });
    optionsByProduct.set(opt.productId, list);
  }

  const items: CartLineItem[] = rows.map((row) => {
    const image = imageByProduct.get(row.productId) ?? { url: "/images/florence-hero.jpg", alt: row.productTitle };
    return {
      id: row.id,
      productId: row.productId,
      productSlug: row.productSlug,
      productTitle: row.productTitle,
      image: { src: image.url, alt: image.alt },
      date: row.date,
      participants: row.participants as CartLineItem["participants"],
      subtotalAmount: row.subtotalAmount,
      currency: row.currency,
      availableOptions: optionsByProduct.get(row.productId) ?? [],
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.subtotalAmount, 0);
  const totalParticipants = items.reduce(
    (sum, item) => sum + item.participants.reduce((s, p) => s + p.quantity, 0),
    0,
  );

  return { items, totalAmount, totalParticipants, currency: items[0]?.currency ?? "EUR" };
}
