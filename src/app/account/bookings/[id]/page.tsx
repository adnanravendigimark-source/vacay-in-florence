import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { getOrderForUser } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Booking Details",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const createdFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  failed: "Failed",
};

type Params = { id: string };

export default async function AccountBookingDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const user = await requireUser(`/account/bookings/${id}`);
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-medium text-ink">Booking {order.id.slice(0, 8)}</h1>
        <span className="rounded-full bg-gold-light px-3 py-1 text-xs font-semibold text-gold">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-faint">Placed {createdFormatter.format(order.createdAt)}</p>

      {order.status === "pending_payment" ? (
        <div className="mt-4 rounded-xl bg-gold-light px-4 py-3 text-sm text-ink-soft">
          Payment isn&apos;t connected in this project yet — this booking is reserved but not confirmed or
          charged. We&apos;ll follow up by email to complete it.
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="rounded-xl border border-stone/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-ink">{item.productTitle}</p>
              <p className="font-medium text-ink">{priceFormatter.format(item.subtotalAmount)}</p>
            </div>
            <p className="mt-1 text-sm text-ink-faint">{dateFormatter.format(new Date(item.date + "T00:00:00"))}</p>
            <ul className="mt-2 space-y-0.5 text-sm text-ink-soft">
              {item.participants.map((p, i) => (
                <li key={i}>
                  {p.quantity} × {p.optionName}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone pt-4">
        <span className="font-medium text-ink">Total</span>
        <span className="font-display text-xl font-medium text-ink">{priceFormatter.format(order.totalAmount)}</span>
      </div>

      <div className="mt-6 border-t border-stone pt-4 text-sm text-ink-soft">
        <p className="font-medium text-ink">Booked by</p>
        <p>{order.customerName}</p>
        <p>{order.customerEmail}</p>
        {order.customerPhone ? <p>{order.customerPhone}</p> : null}
        {order.notes ? <p className="mt-2 italic">&ldquo;{order.notes}&rdquo;</p> : null}
      </div>
    </div>
  );
}
