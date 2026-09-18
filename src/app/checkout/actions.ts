"use server";

import { redirect } from "next/navigation";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, availability, orders, orderItems, carts, products } from "@/lib/db/schema";
import { requireUser } from "@/lib/require-user";
import { getCartId } from "@/lib/cart";
import { checkoutDetailsSchema } from "@/lib/validation/checkout";

/**
 * Places an order from the current cart. This is the real booking write
 * path and it stops exactly where the project's approved checkout
 * boundary says to stop: availability is re-validated and decremented
 * for real, an `orders` row is created in `pending_payment`, and that's
 * it — no payment is taken, nothing is marked `confirmed`, and the
 * confirmation page says so explicitly. See booking-confirmation/[id].
 */
export async function placeOrderAction(formData: FormData): Promise<void> {
  const user = await requireUser("/checkout");

  const parsed = checkoutDetailsSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check your details and try again.";
    redirect(`/checkout?error=${encodeURIComponent(message)}`);
  }

  const cartId = await getCartId();
  if (!cartId) {
    redirect("/cart");
  }

  const items = db.select().from(cartItems).where(eq(cartItems.cartId, cartId)).all();
  if (items.length === 0) {
    redirect("/cart");
  }

  // Re-validate availability for every line, for real, right before
  // committing — never trust what was checked when the item was added
  // to the cart, which could be minutes or days ago.
  const dates = Array.from(new Set(items.map((i) => i.date)));
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const availabilityRows = db
    .select()
    .from(availability)
    .where(and(inArray(availability.productId, productIds), inArray(availability.date, dates)))
    .all();
  const availabilityByKey = new Map(availabilityRows.map((row) => [`${row.productId}:${row.date}`, row]));

  for (const item of items) {
    const participants = item.participants as { quantity: number }[];
    const requested = participants.reduce((sum, p) => sum + p.quantity, 0);
    const row = availabilityByKey.get(`${item.productId}:${item.date}`);
    const remaining = row ? row.capacityTotal - row.capacityBooked : 0;
    if (!row || remaining < requested) {
      redirect(
        `/cart?error=${encodeURIComponent("Availability changed for one of your items — please review your cart before checking out.")}`,
      );
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.subtotalAmount, 0);

  // Snapshot product titles at order time (orderItems.productTitle),
  // since the product's title could change later.
  const productRows = db.select({ id: products.id, title: products.title }).from(products).where(inArray(products.id, productIds)).all();
  const titleByProductId = new Map(productRows.map((p) => [p.id, p.title]));

  const orderId = db.transaction((tx) => {
    for (const item of items) {
      const participants = item.participants as { quantity: number }[];
      const requested = participants.reduce((sum, p) => sum + p.quantity, 0);
      const row = availabilityByKey.get(`${item.productId}:${item.date}`)!;
      tx.update(availability)
        .set({ capacityBooked: row.capacityBooked + requested, updatedAt: new Date() })
        .where(eq(availability.id, row.id))
        .run();
    }

    const [order] = tx
      .insert(orders)
      .values({
        userId: user.id,
        status: "pending_payment",
        totalAmount,
        currency: "EUR",
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone || null,
        notes: parsed.data.notes || null,
      })
      .returning()
      .all();

    tx.insert(orderItems)
      .values(
        items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productTitle: titleByProductId.get(item.productId) ?? "Experience",
          date: item.date,
          participants: item.participants,
          currency: item.currency,
          subtotalAmount: item.subtotalAmount,
        })),
      )
      .run();

    tx.delete(cartItems).where(eq(cartItems.cartId, cartId)).run();
    tx.delete(carts).where(eq(carts.id, cartId)).run();

    return order.id;
  });

  redirect(`/booking-confirmation/${orderId}`);
}
