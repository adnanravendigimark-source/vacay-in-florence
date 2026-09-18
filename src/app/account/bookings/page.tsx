import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { getOrdersForUser } from "@/lib/data/orders";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "My Bookings",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const STATUS_STYLE: Record<string, string> = {
  pending_payment: "bg-gold-light text-gold",
  confirmed: "bg-cypress-light text-cypress",
  cancelled: "bg-stone text-ink-faint",
  failed: "bg-terracotta-light text-terracotta-dark",
};
const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  failed: "Failed",
};

export default async function AccountBookingsPage() {
  const user = await requireUser("/account/bookings");
  const orders = await getOrdersForUser(user.id);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
      <h1 className="font-display text-2xl font-medium text-ink">My Bookings</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No bookings yet"
            description="Once you book an experience, it'll show up here."
            actionLabel="Browse experiences"
            actionHref="/experiences"
          />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-stone">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/bookings/${order.id}`}
              className="flex flex-col gap-2 py-4 transition hover:opacity-80 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">Booking {order.id.slice(0, 8)}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[order.status] ?? "bg-stone text-ink-faint"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {order.items.map((i) => i.productTitle).join(", ")}
                </p>
                <p className="text-xs text-ink-faint">{dateFormatter.format(order.createdAt)}</p>
              </div>
              <p className="font-display text-lg font-medium text-ink">{priceFormatter.format(order.totalAmount)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
