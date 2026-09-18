"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { products, productOptions, availability, cartItems } from "@/lib/db/schema";
import { getOrCreateCart } from "@/lib/cart";
import { addToCartSchema } from "@/lib/validation/checkout";

export interface AddToCartState {
  status: "idle" | "error" | "success";
  message?: string;
}

/**
 * Adds a date + option selection to the visitor's cart. Re-validates
 * availability against the `availability` table at write time — the
 * client only ever sends a date and quantities, never a "this is
 * available" claim, so a sold-out date is caught here even if the page
 * the visitor loaded is a few minutes stale.
 */
export async function addToCartAction(
  productSlug: string,
  _prevState: AddToCartState,
  formData: FormData,
): Promise<AddToCartState> {
  const date = String(formData.get("date") ?? "");
  const optionEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith("option:"));
  const participantsInput = optionEntries
    .map(([key, value]) => ({
      optionId: key.replace("option:", ""),
      quantity: Number.parseInt(String(value), 10) || 0,
    }))
    .filter((p) => p.quantity > 0);

  const product = db.select().from(products).where(and(eq(products.slug, productSlug), eq(products.status, "live"))).get();
  if (!product) {
    return { status: "error", message: "This experience is no longer available." };
  }

  const revalidated = addToCartSchema.safeParse({
    productId: product.id,
    date,
    participants: participantsInput,
  });
  if (!revalidated.success) {
    return { status: "error", message: revalidated.error.issues[0]?.message ?? "Select a date and at least one participant." };
  }

  const totalParticipants = participantsInput.reduce((sum, p) => sum + p.quantity, 0);
  if (totalParticipants === 0) {
    return { status: "error", message: "Select at least one participant." };
  }
  if (totalParticipants > 30) {
    return { status: "error", message: "For groups over 30, contact us directly." };
  }

  // Re-validate availability for real, right now — never trust the page.
  const availabilityRow = db
    .select()
    .from(availability)
    .where(and(eq(availability.productId, product.id), eq(availability.date, date)))
    .get();
  const remaining = availabilityRow ? availabilityRow.capacityTotal - availabilityRow.capacityBooked : 0;
  if (!availabilityRow || remaining < totalParticipants) {
    return {
      status: "error",
      message: availabilityRow
        ? `Only ${Math.max(remaining, 0)} spot${remaining === 1 ? "" : "s"} left on that date.`
        : "No availability for that date yet — try another day.",
    };
  }

  const options = db
    .select()
    .from(productOptions)
    .where(and(eq(productOptions.productId, product.id), eq(productOptions.isActive, true)))
    .all();
  const optionById = new Map(options.map((o) => [o.id, o]));

  const participants = participantsInput.map((p) => {
    const option = optionById.get(p.optionId);
    if (!option) throw new Error("Selected option no longer exists.");
    return {
      optionId: option.id,
      optionName: option.name,
      quantity: p.quantity,
      unitPriceAmount: option.priceAmount,
    };
  });
  const subtotalAmount = participants.reduce((sum, p) => sum + p.unitPriceAmount * p.quantity, 0);

  const cart = await getOrCreateCart();

  db.insert(cartItems)
    .values({
      cartId: cart.id,
      productId: product.id,
      date,
      participants,
      currency: "EUR",
      subtotalAmount,
    })
    .run();

  revalidatePath("/cart");
  return { status: "success", message: "Added to your cart." };
}
