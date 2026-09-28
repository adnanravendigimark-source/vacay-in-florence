import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCustomerById } from "@/lib/data/admin/customers";
import { requirePermission } from "@/lib/require-user";

export const metadata: Metadata = {
  title: "Customer | Admin | VACAY Florence",
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

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  failed: "Failed",
};

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("customers.view", `/admin/customers/${id}`);
  const customer = await getAdminCustomerById(id);
  if (!customer) notFound();

  const totalSpent = customer.orders
    .filter((o) => o.status === "confirmed")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link href="/admin/customers" className="hover:text-[#2b0934]">
            Customers
          </Link>{" "}
          / {customer.name}
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
          {customer.name}
        </h1>
        <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
          Customer since {dateFormatter.format(customer.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Contact</h2>
          <p className="mt-2 text-sm text-neutral-900">{customer.email}</p>
          {customer.phone ? <p className="text-sm text-neutral-600">{customer.phone}</p> : null}
          {customer.nationality ? <p className="mt-1 text-xs text-neutral-500">{customer.nationality}</p> : null}
        </div>
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Orders</h2>
          <p className="mt-2 text-2xl font-display text-neutral-900">{customer.orders.length}</p>
        </div>
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total spent</h2>
          <p className="mt-2 text-2xl font-display text-neutral-900">{formatPrice(totalSpent, "EUR")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">Order history</h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-neutral-500">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/bookings/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-[#F0ECE6] px-4 py-3 hover:bg-[#FAF8F5]"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {order.items[0]?.productTitle ?? "Booking"}
                    {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {dateFormatter.format(order.createdAt)} · {ORDER_STATUS_LABEL[order.status] ?? order.status}
                  </p>
                </div>
                <p className="text-sm font-medium text-neutral-900">{formatPrice(order.totalAmount, order.currency)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {customer.contactMessages.length > 0 ? (
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
            Contact form messages
          </h2>
          <div className="space-y-3">
            {customer.contactMessages.map((m) => (
              <div key={m.id} className="rounded-xl border border-[#F0ECE6] px-4 py-3">
                <p className="text-xs text-neutral-500">{dateFormatter.format(m.createdAt)} · {m.status}</p>
                {m.message ? <p className="mt-1 text-sm text-neutral-700">{m.message}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
