import type { Metadata } from "next";
import Link from "next/link";
import { getCartSummary } from "@/lib/data/cart";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { CartItemCard } from "@/components/cart/cart-item-card";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export default async function CartPage() {
  const cart = await getCartSummary();

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Your Cart</h1>

      {cart.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            description="Browse Florence experiences and add a date to get started."
            actionLabel="Browse experiences"
            actionHref="/experiences"
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                <path d="M5 6L7 20H19L21 6H5Z" strokeLinejoin="round" />
                <path d="M9 6V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V6" />
              </svg>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </div>

          <div className="rounded-2xl border border-stone-dark bg-white p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28 lg:h-fit">
            <h2 className="font-display text-lg font-medium text-ink">Order summary</h2>
            <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
              <span>{cart.totalParticipants} participant{cart.totalParticipants === 1 ? "" : "s"}</span>
              <span>{priceFormatter.format(cart.totalAmount)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-stone pt-3">
              <span className="font-medium text-ink">Total</span>
              <span className="font-display text-xl font-medium text-ink">{priceFormatter.format(cart.totalAmount)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 block w-full rounded-full bg-terracotta px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-terracotta-dark"
            >
              Proceed to Checkout
            </Link>
            <p className="mt-3 text-center text-xs text-ink-faint">Free cancellation up to 24 hours before, on most experiences</p>
          </div>
        </div>
      )}
    </Container>
  );
}
