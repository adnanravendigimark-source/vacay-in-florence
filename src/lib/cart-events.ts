"use client";

/**
 * The header's cart-count badge (site-header.tsx) only re-fetches
 * `/api/cart/count` when the pathname changes — it has no other way to
 * learn that a cart mutation happened. That's fine for a full navigation
 * (e.g. landing on /cart), but "Add to Cart" on a product page submits a
 * same-page server action: the pathname never changes, so the badge was
 * silently stuck at whatever it showed on load. Cart mutations call
 * notifyCartUpdated() after they succeed, and the header listens for it.
 */
export const CART_UPDATED_EVENT = "vacay:cart-updated";

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}
