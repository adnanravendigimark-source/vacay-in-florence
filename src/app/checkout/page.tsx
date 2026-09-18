import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { requireUser } from "@/lib/require-user";
import { getCartSummary } from "@/lib/data/cart";
import { Container } from "@/components/ui/container";
import { FormField, FormError } from "@/components/auth/auth-card";
import { placeOrderAction } from "./actions";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser("/checkout");
  const { error } = await searchParams;
  const cart = await getCartSummary();

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Checkout</h1>

      <div className="mt-4 rounded-xl bg-gold-light px-4 py-3 text-sm text-ink-soft">
        <strong className="font-semibold text-ink">Payment isn&apos;t connected yet.</strong> Placing this
        order reserves your spot and creates a booking marked{" "}
        <span className="font-medium">pending payment</span> — it is not a confirmed, paid booking. Our
        team will follow up to complete payment before your experience date.
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form action={placeOrderAction} className="space-y-4 rounded-2xl border border-stone/60 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-medium text-ink">Your details</h2>
            <FormError message={error} />
            <FormField label="Full name" name="customerName" autoComplete="name" defaultValue={user.name ?? ""} />
            <FormField label="Email" name="customerEmail" type="email" autoComplete="email" defaultValue={user.email ?? ""} />
            <FormField label="Phone (optional)" name="customerPhone" type="tel" required={false} autoComplete="tel" />
            <div>
              <label htmlFor="notes" className="text-sm font-medium text-ink">
                Notes for your booking (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-stone-dark px-3.5 py-2.5 text-sm text-ink outline-none focus:border-cypress"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-terracotta px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
            >
              Place booking request
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-stone-dark bg-white p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28 lg:h-fit">
          <h2 className="font-display text-lg font-medium text-ink">Order summary</h2>
          <div className="mt-4 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                  <Image src={item.image.src} alt={item.image.alt} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-ink line-clamp-1">{item.productTitle}</p>
                  <p className="text-ink-faint">{dateFormatter.format(new Date(item.date + "T00:00:00"))}</p>
                </div>
                <p className="text-sm font-medium text-ink">{priceFormatter.format(item.subtotalAmount)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-stone pt-3">
            <span className="font-medium text-ink">Total</span>
            <span className="font-display text-xl font-medium text-ink">{priceFormatter.format(cart.totalAmount)}</span>
          </div>
        </div>
      </div>
    </Container>
  );
}
