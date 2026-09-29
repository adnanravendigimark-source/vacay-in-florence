import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSupplier } from "@/lib/require-user";
import { getSupplierBooking } from "@/lib/data/supplier/bookings";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/data/admin/booking-status";
import { Badge } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Booking Detail | Supplier",
  robots: { index: false, follow: false },
};

const STATUS_TONE: Record<OrderStatus, "neutral" | "success" | "warning" | "danger"> = {
  confirmed: "success",
  pending_payment: "warning",
  cancelled: "danger",
  failed: "danger",
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

type Params = { id: string };

export default async function SupplierBookingDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const supplier = await requireSupplier(`/supplier/bookings/${id}`);
  const booking = await getSupplierBooking(id, supplier.supplierId);
  if (!booking) notFound();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link href="/supplier/bookings" className="text-xs font-medium text-ink-faint hover:text-cypress">
          ← Bookings
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-medium text-ink">{booking.productTitle}</h1>
          <Badge tone={STATUS_TONE[booking.status]}>{ORDER_STATUS_LABEL[booking.status]}</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Booking</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-neutral-500">Date</dt>
            <dd className="mt-0.5 text-neutral-900">{booking.date}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Booked on</dt>
            <dd className="mt-0.5 text-neutral-900">{dateFormatter.format(booking.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Amount</dt>
            <dd className="mt-0.5 text-neutral-900">{priceFormatter.format(booking.subtotalAmount)}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Order reference</dt>
            <dd className="mt-0.5 font-mono text-xs text-neutral-500">{booking.orderId}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Participants</h2>
        <ul className="divide-y divide-[#F0ECE6]">
          {booking.participants.map((p, i) => (
            <li key={`${p.optionId}-${i}`} className="flex items-center justify-between py-2 text-sm">
              <span className="text-neutral-900">
                {p.quantity}× {p.optionName}
              </span>
              <span className="text-neutral-500">{priceFormatter.format(p.unitPriceAmount)} each</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Customer</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-neutral-500">Name</dt>
            <dd className="mt-0.5 text-neutral-900">{booking.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Email</dt>
            <dd className="mt-0.5 text-neutral-900">{booking.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Phone</dt>
            <dd className="mt-0.5 text-neutral-900">{booking.customerPhone ?? "—"}</dd>
          </div>
        </dl>
        {booking.notes ? (
          <div className="mt-4 border-t border-[#F0ECE6] pt-4">
            <dt className="text-xs text-neutral-500">Order notes</dt>
            <dd className="mt-0.5 text-sm text-neutral-700">{booking.notes}</dd>
          </div>
        ) : null}
      </div>
    </div>
  );
}
