import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { getOrderForUser } from "@/lib/data/orders";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Booking Request Received",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

type Params = { orderId: string };

export default async function BookingConfirmationPage({ params }: { params: Promise<Params> }) {
  const { orderId } = await params;
  const user = await requireUser(`/booking-confirmation/${orderId}`);
  const order = await getOrderForUser(orderId, user.id);
  if (!order) notFound();

  return (
    <Container className="max-w-2xl py-10 sm:py-14">
      <div className="rounded-2xl border border-stone/60 bg-white p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-light text-gold">
          <svg viewBox="0 0 20 20" className="h-6 w-6 fill-current">
            <path d="M8.5 13.5l-3-3 1.06-1.06L8.5 11.38l5.44-5.44L15 7l-6.5 6.5z" />
          </svg>
        </div>
        <h1 className="mt-4 font-display text-2xl font-medium text-ink sm:text-3xl">Booking request received</h1>
        <p className="mt-2 text-ink-soft">
          We&apos;ve reserved these spots and created booking <span className="font-mono text-sm">{order.id.slice(0, 8)}</span>.
        </p>

        <div className="mt-4 rounded-xl bg-gold-light px-4 py-3 text-sm text-ink-soft">
          <strong className="font-semibold text-ink">This booking is not yet confirmed.</strong> Payment
          isn&apos;t connected in this project yet, so nothing has been charged and status is{" "}
          <span className="font-medium">pending payment</span> — not a completed booking. Our team will
          reach out to {order.customerEmail} to complete payment and confirm it.
        </div>

        <div className="mt-6 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-stone pb-3 text-sm">
              <div>
                <p className="font-medium text-ink">{item.productTitle}</p>
                <p className="text-ink-faint">{dateFormatter.format(new Date(item.date + "T00:00:00"))}</p>
              </div>
              <p className="font-medium text-ink">{priceFormatter.format(item.subtotalAmount)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-medium text-ink">Total</span>
          <span className="font-display text-xl font-medium text-ink">{priceFormatter.format(order.totalAmount)}</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/account/bookings"
            className="flex-1 rounded-full bg-cypress px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-cypress/90"
          >
            View your bookings
          </Link>
          <Link
            href="/experiences"
            className="flex-1 rounded-full border border-stone-dark px-6 py-3 text-center text-sm font-semibold text-ink-soft transition hover:bg-cream-deep"
          >
            Keep browsing
          </Link>
        </div>
      </div>
    </Container>
  );
}
