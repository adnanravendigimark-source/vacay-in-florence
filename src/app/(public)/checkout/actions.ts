"use server";

import { redirect } from "next/navigation";
import { eq, and, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, availability, orders, orderItems, carts, products } from "@/lib/db/schema";
import { requireUser } from "@/lib/require-user";
import { getCartId } from "@/lib/cart";
import { checkoutDetailsSchema } from "@/lib/validation/checkout";

/** Internal signal only — thrown inside the transaction to force a
 * rollback when a line loses the availability race, caught right outside. */
class SoldOutError extends Error {}

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

  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  if (items.length === 0) {
    redirect("/cart");
  }

  // Fast-path check, purely for a nicer error message before we even open
  // a transaction — never trust what was checked when the item was added
  // to the cart, which could be minutes or days ago. This is NOT the
  // authoritative guard against overbooking (see below): with Postgres,
  // every `await` here is a point where another request's checkout can
  // interleave, so a read this far outside a transaction can be stale by
  // the time we actually write.
  const dates = Array.from(new Set(items.map((i) => i.date)));
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const availabilityRows = await db
    .select()
    .from(availability)
    .where(and(inArray(availability.productId, productIds), inArray(availability.date, dates)));
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
  const productRows = await db.select({ id: products.id, title: products.title }).from(products).where(inArray(products.id, productIds));
  const titleByProductId = new Map(productRows.map((p) => [p.id, p.title]));

  let orderId: string;
  try {
    orderId = await db.transaction(async (tx) => {
      for (const item of items) {
        const participants = item.participants as { quantity: number }[];
        const requested = participants.reduce((sum, p) => sum + p.quantity, 0);

        // The real, race-safe guard: a single conditional UPDATE that only
        // succeeds if enough capacity remains at the moment of the write
        // (not at the moment we last read it a few lines up). Postgres
        // locks the matched row for the statement, so two concurrent
        // checkouts for the last spot can't both succeed — the second
        // one's WHERE clause fails to match and 0 rows come back.
        const [updated] = await tx
          .update(availability)
          .set({
            capacityBooked: sql`${availability.capacityBooked} + ${requested}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(availability.productId, item.productId),
              eq(availability.date, item.date),
              sql`(${availability.capacityTotal} - ${availability.capacityBooked}) >= ${requested}`,
            ),
          )
          .returning();

        if (!updated) {
          throw new SoldOutError();
        }
      }

      const [order] = await tx
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
        .returning();

      await tx.insert(orderItems).values(
        items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productTitle: titleByProductId.get(item.productId) ?? "Experience",
          date: item.date,
          participants: item.participants,
          currency: item.currency,
          subtotalAmount: item.subtotalAmount,
        })),
      );

      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
      await tx.delete(carts).where(eq(carts.id, cartId));

      return order.id;
    });
  } catch (error) {
    if (error instanceof SoldOutError) {
      redirect(
        `/cart?error=${encodeURIComponent("Availability changed for one of your items — please review your cart before checking out.")}`,
      );
    }
    throw error;
  }

  redirect(`/booking-confirmation/${orderId}`);
}
