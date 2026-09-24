import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { getOrderForUser } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Booking Details | VACAY Florence",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const createdFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const STATUS_STYLE: Record<string, { label: string; tone: "green" | "amber" | "red" }> = {
  confirmed: { label: "Confirmed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
  failed: { label: "Failed", tone: "red" },
  pending_payment: { label: "Pending payment", tone: "amber" },
};

type Params = { id: string };

export default async function AccountBookingDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const user = await requireUser(`/account/bookings/${id}`);
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  const status = STATUS_STYLE[order.status] ?? { label: order.status, tone: "amber" as const };
  const heroItem = order.items[0];

  return (
    <div className="space-y-6">
      <Link
        href="/account/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink transition-colors"
      >
        <span>&larr;</span>
        <span>Back to My Bookings</span>
      </Link>

      <div className="rounded-3xl bg-white border border-stone shadow-[0_4px_25px_rgba(43,9,52,0.03)] overflow-hidden">
        {heroItem ? (
          <div className="relative h-40 sm:h-56 w-full bg-stone/40">
            <Image src={heroItem.image.src} alt={heroItem.image.alt} fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-white/80 text-xs font-medium">Booking #{order.id.slice(0, 8).toUpperCase()}</p>
                <h1 className="font-display text-xl sm:text-2xl font-medium text-white mt-0.5">
                  {heroItem.productTitle}
                  {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                </h1>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  status.tone === "green"
                    ? "bg-emerald-500/90 text-white backdrop-blur-md"
                    : status.tone === "amber"
                      ? "bg-amber-500/90 text-white backdrop-blur-md"
                      : "bg-rose-500/90 text-white backdrop-blur-md"
                }`}
              >
                {status.label}
              </span>
            </div>
          </div>
        ) : null}

        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!heroItem ? (
              <div>
                <p className="text-xs text-ink-faint font-medium">Booking #{order.id.slice(0, 8).toUpperCase()}</p>
                <h1 className="font-display text-xl font-medium text-ink mt-0.5">Booking</h1>
              </div>
            ) : null}
            <p className="text-xs text-ink-faint">Placed {createdFormatter.format(order.createdAt)}</p>
            {!heroItem ? (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  status.tone === "green"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : status.tone === "amber"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {status.label}
              </span>
            ) : null}
          </div>

          {order.status === "pending_payment" ? (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Payment isn&apos;t connected in this project yet — this booking is reserved but not confirmed or
              charged. We&apos;ll follow up by email to complete it.
            </div>
          ) : null}

          {/* Items */}
          <div className="space-y-3">
            <h2 className="font-display text-base font-medium text-ink">Experience details</h2>
            {order.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-stone p-4 bg-cream/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{item.productTitle}</p>
                    <p className="mt-1 text-sm text-ink-soft">{dateFormatter.format(new Date(item.date + "T00:00:00"))}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-ink-faint/80">
                        <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      <span>{item.location}</span>
                    </p>
                  </div>
                  <p className="font-medium text-ink shrink-0">{priceFormatter.format(item.subtotalAmount)}</p>
                </div>
                <ul className="mt-3 space-y-0.5 text-sm text-ink-soft">
                  {item.participants.map((p, i) => (
                    <li key={i}>
                      {p.quantity} × {p.optionName}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-stone pt-4">
            <span className="font-medium text-ink">Total</span>
            <span className="font-display text-xl font-medium text-ink">{priceFormatter.format(order.totalAmount)}</span>
          </div>

          <div className="border-t border-stone pt-4 text-sm text-ink-soft space-y-0.5">
            <p className="font-medium text-ink">Booked by</p>
            <p>{order.customerName}</p>
            <p>{order.customerEmail}</p>
            {order.customerPhone ? <p>{order.customerPhone}</p> : null}
            {order.notes ? <p className="mt-2 italic">&ldquo;{order.notes}&rdquo;</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
