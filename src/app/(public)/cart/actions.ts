"use server";

import { revalidatePath } from "next/cache";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, productOptions } from "@/lib/db/schema";
import { getCartId } from "@/lib/cart";

/** Removes one cart line. Scoped to the visitor's own cart id from the cookie — never trusts an item id alone. */
export async function removeCartItemAction(formData: FormData): Promise<void> {
  const itemId = String(formData.get("itemId") ?? "");
  const cartId = await getCartId();
  if (!cartId || !itemId) return;

  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
  revalidatePath("/cart");
}

/**
 * Updates the option quantities on one cart line. Prices are re-read
 * from `product_options` here, never taken from the submitted form, so
 * the recalculated subtotal always reflects current pricing. A line
 * whose quantities all drop to 0 is removed outright rather than kept
 * as an empty row.
 */
export async function updateCartItemAction(formData: FormData): Promise<void> {
  const itemId = String(formData.get("itemId") ?? "");
  const cartId = await getCartId();
  if (!cartId || !itemId) return;

  const [item] = await db.select().from(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
  if (!item) return;

  const entries = Array.from(formData.entries()).filter(([key]) => key.startsWith("option:"));
  const requested = entries
    .map(([key, value]) => ({ optionId: key.replace("option:", ""), quantity: Number.parseInt(String(value), 10) || 0 }))
    .filter((p) => p.quantity > 0);

  if (requested.length === 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    revalidatePath("/cart");
    return;
  }

  const optionIds = requested.map((r) => r.optionId);
  const options = await db.select().from(productOptions).where(inArray(productOptions.id, optionIds));
  const optionById = new Map(options.map((o) => [o.id, o]));

  const participants = requested
    .filter((r) => optionById.has(r.optionId))
    .map((r) => {
      const option = optionById.get(r.optionId)!;
      return { optionId: option.id, optionName: option.name, quantity: r.quantity, unitPriceAmount: option.priceAmount };
    });

  if (participants.length === 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    revalidatePath("/cart");
    return;
  }

  const subtotalAmount = participants.reduce((sum, p) => sum + p.unitPriceAmount * p.quantity, 0);

  await db.update(cartItems)
    .set({ participants, subtotalAmount, updatedAt: new Date() })
    .where(eq(cartItems.id, itemId));

  revalidatePath("/cart");
}
