import type { Metadata } from "next";
import Link from "next/link";
import { listAdminOrders, countAdminOrdersByStatus } from "@/lib/data/admin/bookings";
import { BookingsTable } from "@/components/admin/bookings-table";
import { requirePermission } from "@/lib/require-user";

export const metadata: Metadata = {
  title: "Bookings | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminBookingsPage() {
  await requirePermission("bookings.view", "/admin/bookings");
  const [items, statusCounts] = await Promise.all([listAdminOrders(), countAdminOrdersByStatus()]);
  const totalRevenue = items
    .filter((o) => o.status === "confirmed")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          / Bookings
        </p>
        <div className="mt-1">
          <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">Bookings</h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
            Every order placed on the site. Status changes here are manual — there is no payment processor wired
            up yet, so confirming or cancelling a booking is an admin decision, logged to the audit trail.
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        {items.length} booking{items.length === 1 ? "" : "s"} shown (most recent 200)
        {items.length > 0 ? ` · €${totalRevenue.toFixed(0)} confirmed revenue in this list` : ""}
      </p>

      <BookingsTable items={items} statusCounts={statusCounts} />
    </div>
  );
}
