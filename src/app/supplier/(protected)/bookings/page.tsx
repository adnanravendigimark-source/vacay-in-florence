import type { Metadata } from "next";
import Link from "next/link";
import { requireSupplier } from "@/lib/require-user";
import { listSupplierBookings } from "@/lib/data/supplier/bookings";
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/lib/data/admin/booking-status";
import { PageHeader, Badge, Table, THead, TBody, TR, TH, TD } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Bookings | Supplier",
  robots: { index: false, follow: false },
};

const STATUS_TONE: Record<OrderStatus, "neutral" | "success" | "warning" | "danger"> = {
  confirmed: "success",
  pending_payment: "warning",
  cancelled: "danger",
  failed: "danger",
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

export default async function SupplierBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supplier = await requireSupplier("/supplier/bookings");
  const { status } = await searchParams;
  const statusFilter = status && ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const bookings = await listSupplierBookings(supplier.supplierId, { status: statusFilter });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader title="Bookings" description="Every booking for your experiences, synced live from the public site." />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/supplier/bookings"
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            !statusFilter ? "border-cypress bg-cypress text-white" : "border-stone bg-white text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/supplier/bookings?status=${s}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === s ? "border-cypress bg-cypress text-white" : "border-stone bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {ORDER_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EAE6DF] bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">No bookings {statusFilter ? `with status "${ORDER_STATUS_LABEL[statusFilter]}"` : "yet"}.</p>
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Experience</TH>
              <TH>Customer</TH>
              <TH>Date</TH>
              <TH>Status</TH>
              <TH>Amount</TH>
              <TH>{""}</TH>
            </TR>
          </THead>
          <TBody>
            {bookings.map((b) => (
              <TR key={b.id}>
                <TD className="font-medium text-neutral-900">{b.productTitle}</TD>
                <TD>
                  <p>{b.customerName}</p>
                  <p className="text-xs text-neutral-500">{b.customerEmail}</p>
                </TD>
                <TD>{b.date}</TD>
                <TD>
                  <Badge tone={STATUS_TONE[b.status]}>{ORDER_STATUS_LABEL[b.status]}</Badge>
                </TD>
                <TD>{priceFormatter.format(b.subtotalAmount)}</TD>
                <TD>
                  <Link href={`/supplier/bookings/${b.id}`} className="text-xs font-medium text-cypress hover:underline">
                    View
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
