import type { Metadata } from "next";
import Link from "next/link";
import { getCartSummary } from "@/lib/data/cart";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CartBadgeSync } from "@/components/cart/cart-badge-sync";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export default async function CartPage() {
  const cart = await getCartSummary();

  return (
    <div className="w-full bg-[#FCFBF9] min-h-[85vh] py-10 sm:py-14">
      <Container>
        <CartBadgeSync count={cart.totalParticipants} />

        {/* Header: Title + Continue Shopping Link */}
        <div className="flex items-center justify-between gap-4 pb-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">
            Your Cart {cart.items.length > 0 && `(${cart.items.length})`}
          </h1>

          <Link
            href="/experiences"
            className="text-xs sm:text-sm font-semibold text-[#581c6a] hover:text-[#2b0934] transition-colors flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Your cart is empty"
              description="Browse Florence experiences and add a date to get started."
              actionLabel="Browse experiences"
              actionHref="/experiences"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2 text-[#a813c9]">
                  <path d="M5 6L7 20H19L21 6H5Z" strokeLinejoin="round" />
                  <path d="M9 6V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V6" />
                </svg>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
            {/* Left Column: Cart Line Items */}
            <div className="space-y-6 lg:col-span-2">
              {cart.items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="rounded-2xl border border-stone-200/90 bg-[#FAF8F5] p-6 shadow-xs lg:sticky lg:top-28">
              <h2 className="font-display text-xl font-bold text-neutral-900">Order Summary</h2>

              {/* Participant breakdown */}
              <div className="mt-5 flex items-center justify-between text-sm text-neutral-700">
                <span>
                  {cart.totalParticipants} participant{cart.totalParticipants === 1 ? "" : "s"}
                </span>
                <span className="font-semibold text-neutral-900">{priceFormatter.format(cart.totalAmount)}</span>
              </div>

              {/* Hairline Divider */}
              <div className="my-4 border-t border-stone-200/80" />

              {/* Total row */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-base">Total</span>
                <span className="font-display text-2xl font-bold text-neutral-900">
                  {priceFormatter.format(cart.totalAmount)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="mt-6 flex items-center justify-center gap-2 w-full rounded-full bg-[#2B0934] hover:bg-[#3D0D4A] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <span>&rarr;</span>
              </Link>

              {/* Reassurance Footer */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#a813c9] shrink-0 fill-none stroke-current stroke-2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Free cancellation up to 24 hours before your experience</span>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

