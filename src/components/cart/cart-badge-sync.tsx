"use client";

import { useEffect } from "react";
import { notifyCartUpdated } from "@/lib/cart-events";

/**
 * The cart page's own remove/update-quantity actions are plain
 * fire-and-forget server actions (no useActionState), so — same root
 * cause as the "Add to Cart" badge bug — nothing tells the header's
 * cart-count badge that a mutation happened. But this page always
 * re-renders with a fresh server-computed count after any such
 * mutation, so syncing off that count (rather than each individual
 * action) covers remove and quantity-update in one place.
 */
export function CartBadgeSync({ count }: { count: number }) {
  useEffect(() => {
    notifyCartUpdated();
  }, [count]);

  return null;
}
