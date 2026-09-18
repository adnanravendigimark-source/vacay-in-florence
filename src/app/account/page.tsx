import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/require-user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getOrdersForUser } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  failed: "Failed",
};

export default async function AccountOverviewPage() {
  const sessionUser = await requireUser("/account");
  const dbUser = db.select().from(users).where(eq(users.id, sessionUser.id)).get();
  const orders = await getOrdersForUser(sessionUser.id);
  const recent = orders.slice(0, 3);
  const firstName = dbUser?.name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
        <h1 className="font-display text-2xl font-medium text-ink">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {orders.length} booking{orders.length === 1 ? "" : "s"} on your account.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Recent bookings</h2>
          <Link href="/account/bookings" className="text-sm font-medium text-cypress hover:underline">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            No bookings yet.{" "}
            <Link href="/experiences" className="font-medium text-cypress hover:underline">
              Browse experiences
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-stone">
            {recent.map((order) => (
              <Link
                key={order.id}
                href={`/account/bookings/${order.id}`}
                className="flex items-center justify-between gap-3 py-3 text-sm transition hover:opacity-80"
              >
                <div>
                  <p className="font-medium text-ink">
                    {order.items[0]?.productTitle}
                    {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                  </p>
                  <p className="text-ink-faint">{dateFormatter.format(order.createdAt)} · {STATUS_LABEL[order.status] ?? order.status}</p>
                </div>
                <p className="font-medium text-ink">{priceFormatter.format(order.totalAmount)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
