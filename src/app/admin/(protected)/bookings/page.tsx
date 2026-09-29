import type { Metadata } from "next";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Bookings
        </h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Monitor customer reservations, track orders, and manage payment statuses across all tours.
        </p>
      </div>

      <BookingsTable items={items} statusCounts={statusCounts} />
    </div>
  );
}
