import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getAdminOrderById } from "@/lib/data/admin/bookings";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { requirePermission } from "@/lib/require-user";

export const metadata: Metadata = {
  title: "Booking | Admin | VACAY Florence",
  robots: { index: false },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("bookings.view", `/admin/bookings/${id}`);
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link href="/admin/bookings" className="hover:text-[#2b0934]">
            Bookings
          </Link>{" "}
          / Order
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
              Placed {dateFormatter.format(order.createdAt)}
            </p>
          </div>
          <OrderStatusControl orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Customer</h2>
          <p className="mt-2 text-sm font-medium text-neutral-900">{order.customerName}</p>
          <p className="text-sm text-neutral-600">{order.customerEmail}</p>
          {order.customerPhone ? <p className="text-sm text-neutral-600">{order.customerPhone}</p> : null}
        </div>
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Order total</h2>
          <p className="mt-2 text-2xl font-display text-neutral-900">{formatPrice(order.totalAmount, order.currency)}</p>
          {order.notes ? <p className="mt-2 text-xs text-neutral-500">Note: {order.notes}</p> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
          {order.items.length} item{order.items.length === 1 ? "" : "s"}
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b border-[#F5F3EF] pb-4 last:border-0 last:pb-0">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F0ECE6]">
                <Image src={item.image.src} alt={item.image.alt} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                {item.productSlug ? (
                  <Link
                    href={`/admin/experiences`}
                    className="text-sm font-medium text-neutral-900 hover:text-[#2b0934]"
                  >
                    {item.productTitle}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-neutral-900">{item.productTitle}</p>
                )}
                <p className="text-xs text-neutral-500">{item.date}</p>
                <ul className="mt-1 space-y-0.5">
                  {item.participants.map((p, i) => (
                    <li key={i} className="text-xs text-neutral-500">
                      {p.quantity} × {p.optionName} ({formatPrice(p.unitPriceAmount, item.currency)} each)
                    </li>
                  ))}
                </ul>
              </div>
              <p className="shrink-0 text-sm font-medium text-neutral-900">
                {formatPrice(item.subtotalAmount, item.currency)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
