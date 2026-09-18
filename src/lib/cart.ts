import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema";

const CART_COOKIE = "vacay_cart_id";
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Cart persistence: an httpOnly cookie holds the cart's id. Guest carts
 * have `userId = null`; once someone logs in, `mergeGuestCartIntoUser`
 * folds any guest-cart rows into (or creates) their user-linked cart on a
 * best-effort basis — a failed merge just means an empty cart, never a
 * broken login.
 */

export async function getCartId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value;
}

async function setCartCookie(cartId: string) {
  const store = await cookies();
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
  });
}

/**
 * Returns the current cart row, creating one (and setting the cookie) if
 * none exists yet. `userId` is passed when the caller already knows the
 * signed-in user, so a freshly created cart is linked immediately rather
 * than created as a guest cart that then needs merging.
 */
export async function getOrCreateCart(userId?: string) {
  const existingId = await getCartId();

  if (existingId) {
    const existing = db.select().from(carts).where(eq(carts.id, existingId)).get();
    if (existing) {
      // If the visitor is now signed in but the cookie still points at a
      // guest cart, claim it rather than orphaning it.
      if (userId && !existing.userId) {
        const [claimed] = db
          .update(carts)
          .set({ userId, updatedAt: new Date() })
          .where(eq(carts.id, existing.id))
          .returning()
          .all();
        return claimed;
      }
      return existing;
    }
  }

  const [created] = db.insert(carts).values({ userId: userId ?? null }).returning().all();
  await setCartCookie(created.id);
  return created;
}

/**
 * Called right after a successful login. Folds any guest cart items on
 * this browser into the user's own cart (creating one if they don't have
 * one yet), then repoints the cookie at it. Best-effort: cart merging is
 * a convenience, never something that should block or fail a login.
 */
export async function mergeGuestCartIntoUser(userId: string) {
  try {
    const guestCartId = await getCartId();
    if (!guestCartId) return;

    const guestCart = db.select().from(carts).where(eq(carts.id, guestCartId)).get();
    if (!guestCart || guestCart.userId === userId) return;

    if (!guestCart.userId) {
      // Guest cart with no owner yet — just claim it.
      db.update(carts).set({ userId, updatedAt: new Date() }).where(eq(carts.id, guestCart.id)).run();
      return;
    }

    // Guest cart already belongs to a different user (shared device) —
    // move this cart's items onto the current user's cart instead of
    // reassigning ownership of someone else's cart.
    const items = db.select().from(cartItems).where(eq(cartItems.cartId, guestCart.id)).all();
    if (items.length === 0) return;

    let targetCart = db.select().from(carts).where(eq(carts.userId, userId)).get();
    if (!targetCart) {
      [targetCart] = db.insert(carts).values({ userId }).returning().all();
    }

    for (const item of items) {
      db.insert(cartItems)
        .values({
          cartId: targetCart.id,
          productId: item.productId,
          productOptionId: item.productOptionId,
          date: item.date,
          participants: item.participants,
          currency: item.currency,
          subtotalAmount: item.subtotalAmount,
        })
        .run();
    }
    await setCartCookie(targetCart.id);
  } catch (error) {
    console.error("Cart merge failed (non-fatal):", error);
  }
}

export async function getCartItemCount(): Promise<number> {
  const cartId = await getCartId();
  if (!cartId) return 0;
  const items = db.select().from(cartItems).where(eq(cartItems.cartId, cartId)).all();
  return items.reduce((sum, item) => {
    const participants = item.participants as { quantity: number }[];
    return sum + participants.reduce((s, p) => s + p.quantity, 0);
  }, 0);
}
