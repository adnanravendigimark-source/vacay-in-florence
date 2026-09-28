"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { setOrderStatusAction } from "@/app/admin/(protected)/bookings/actions";
import type { AdminOrderListItem, OrderStatus } from "@/lib/data/admin/bookings";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/data/admin/booking-status";
import { useToast } from "@/components/admin/ui";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `€${amount.toFixed(0)}`;
  }
}

function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <select
      value={status}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(async () => {
          const result = await setOrderStatusAction(orderId, next);
          if (!result.success) showToast(result.error ?? "Could not update status.", "error");
          else showToast(`Booking marked ${ORDER_STATUS_LABEL[next].toLowerCase()}.`, "success");
        });
      }}
      className="rounded-lg border border-[#EAE6DF] bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 shadow-sm disabled:opacity-50"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export function BookingsTable({
  items,
  statusCounts,
}: {
  items: AdminOrderListItem[];
  statusCounts: Record<string, number>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!term) return true;
      return (
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        o.productTitle.toLowerCase().includes(term) ||
        o.id.toLowerCase().includes(term)
      );
    });
  }, [items, search, statusFilter]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-700">No bookings yet</p>
        <p className="mt-1 text-xs text-neutral-500">Orders placed through checkout will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, email, experience, or order id…"
          className="min-w-[240px] flex-1 rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2b0934]/20"
        />
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
            statusFilter === "all" ? "bg-[#2b0934] text-white" : "bg-[#F0ECE6] text-neutral-600 hover:bg-[#EAE6DF]"
          }`}
        >
          All ({items.length})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
              statusFilter === s ? "bg-[#2b0934] text-white" : "bg-[#F0ECE6] text-neutral-600 hover:bg-[#EAE6DF]"
            }`}
          >
            {ORDER_STATUS_LABEL[s]} ({statusCounts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-[#F5F3EF] last:border-0 hover:bg-[#FAF8F5]">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{order.customerName}</p>
                  <p className="text-[11px] text-neutral-500">{order.customerEmail}</p>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {order.productTitle}
                  {order.extraItemCount > 0 ? (
                    <span className="ml-1.5 text-[11px] text-neutral-400">+{order.extraItemCount} more</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-neutral-500">{dateFormatter.format(order.createdAt)}</td>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {formatPrice(order.totalAmount, order.currency)}
                </td>
                <td className="px-4 py-3">
                  <StatusSelect orderId={order.id} status={order.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/bookings/${order.id}`}
                    className="text-[11px] font-semibold text-[#2b0934] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  No bookings match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
