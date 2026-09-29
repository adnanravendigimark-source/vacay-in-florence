"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setOrderStatusAction } from "@/app/admin/(protected)/bookings/actions";
import type { AdminOrderListItem, OrderStatus } from "@/lib/data/admin/bookings";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/data/admin/booking-status";
import { useToast } from "@/components/admin/ui";

const ITEMS_PER_PAGE = 10;

// Clean Feather-style SVG icons
function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function EuroIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12" />
      <path d="M4 14h10" />
      <path d="M18 6a7 7 0 0 0-11 5.5v1A7 7 0 0 0 18 18" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CloseIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function formatPrice(amount: number, currency: string = "EUR") {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `€${amount.toFixed(0)}`;
  }
}

function formatSimpleDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Confirmed
        </span>
      );
    case "pending_payment":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Payment
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          Cancelled
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Failed
        </span>
      );
  }
}

export function BookingsTable({
  items,
  statusCounts,
}: {
  items: AdminOrderListItem[];
  statusCounts: Record<string, number>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);

  // Calculate high-level summary metrics
  const totalRevenue = useMemo(() => {
    return items
      .filter((o) => o.status === "confirmed")
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [items]);

  const confirmedCount = statusCounts["confirmed"] ?? 0;
  const pendingCount = statusCounts["pending_payment"] ?? 0;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items
      .filter((o) => {
        if (statusFilter !== "all" && o.status !== statusFilter) return false;
        if (!term) return true;
        return (
          o.customerName.toLowerCase().includes(term) ||
          o.customerEmail.toLowerCase().includes(term) ||
          o.productTitle.toLowerCase().includes(term) ||
          o.id.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (sortBy === "latest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "amount_desc") {
          return b.totalAmount - a.totalAmount;
        }
        if (sortBy === "amount_asc") {
          return a.totalAmount - b.totalAmount;
        }
        if (sortBy === "customer_asc") {
          return a.customerName.localeCompare(b.customerName);
        }
        return 0;
      });
  }, [items, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    setActiveMenuOrderId(null);
    startTransition(async () => {
      const result = await setOrderStatusAction(orderId, nextStatus);
      if (!result.success) {
        showToast(result.error ?? "Could not update status.", "error");
      } else {
        showToast(`Booking marked as ${ORDER_STATUS_LABEL[nextStatus].toLowerCase()}.`, "success");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards Bar (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Bookings */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Bookings</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{items.length}</span>
            <span className="text-[11px] font-medium text-neutral-400">All time</span>
          </div>
        </div>

        {/* Confirmed Orders */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Confirmed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircleIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{confirmedCount}</span>
            <span className="text-[11px] font-medium text-emerald-600">
              {items.length > 0 ? `${Math.round((confirmedCount / items.length) * 100)}% active` : "—"}
            </span>
          </div>
        </div>

        {/* Pending Payment */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Pending Payment</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ClockIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{pendingCount}</span>
            {pendingCount > 0 ? (
              <span className="text-[11px] font-medium text-amber-700">Needs action</span>
            ) : (
              <span className="text-[11px] font-medium text-neutral-400">All cleared</span>
            )}
          </div>
        </div>

        {/* Confirmed Gross Revenue */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Confirmed Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <EuroIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{formatPrice(totalRevenue)}</span>
            <span className="text-[11px] font-medium text-neutral-400">Processed</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls Bar */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200/80 pb-3">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#1b3b36] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <span>All Bookings</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                statusFilter === "all" ? "bg-white/20 text-white" : "bg-neutral-200/70 text-neutral-600"
              }`}
            >
              {items.length}
            </span>
          </button>

          {ORDER_STATUSES.map((s) => {
            const isActive = statusFilter === s;
            const count = statusCounts[s] ?? 0;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-[#1b3b36] text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <span>{ORDER_STATUS_LABEL[s]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-neutral-200/70 text-neutral-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, tour title, or order #..."
              className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-8 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-7 text-xs font-medium text-neutral-700 shadow-xs focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none cursor-pointer"
            >
              <option value="latest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="customer_asc">Customer (A-Z)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400">
              <ChevronDownIcon />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Bookings Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Order Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                  <p className="text-sm font-semibold text-neutral-800">No bookings found</p>
                  <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or search terms.</p>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const initial = order.customerName.trim().charAt(0).toUpperCase() || "C";
                const isMenuOpen = activeMenuOrderId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Order ID */}
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/bookings/${order.id}`}
                        className="font-mono font-semibold text-neutral-900 hover:text-[#1b3b36] hover:underline block"
                      >
                        #{order.id.substring(0, 8)}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{order.customerName}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{order.customerEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Experience Title */}
                    <td className="px-4 py-3.5">
                      <div className="min-w-0 max-w-[240px]">
                        <span className="font-medium text-neutral-800 block truncate">
                          {order.productTitle}
                        </span>
                        {order.extraItemCount > 0 && (
                          <span className="inline-flex text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded mt-0.5">
                            +{order.extraItemCount} more item{order.extraItemCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-neutral-500 whitespace-nowrap">
                      {formatSimpleDate(order.createdAt)}
                    </td>

                    {/* Total Amount */}
                    <td className="px-4 py-3.5 font-bold text-neutral-900 whitespace-nowrap">
                      {formatPrice(order.totalAmount, order.currency)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    {/* Actions Menu */}
                    <td className="px-4 py-3.5 text-right relative">
                      <div className="inline-flex items-center gap-2">
                        {/* Quick View Button */}
                        <Link
                          href={`/admin/bookings/${order.id}`}
                          className="font-semibold text-[#1b3b36] hover:underline"
                        >
                          View &rarr;
                        </Link>

                        {/* Status Switcher Select */}
                        <div className="relative">
                          <select
                            value={order.status}
                            disabled={isPending}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                            className="appearance-none rounded-lg border border-neutral-200 bg-white px-2 py-1 pr-5 text-[11px] font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 focus:border-[#1b3b36] focus:outline-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="pending_payment">Pending</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="failed">Failed</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-neutral-400">
                            <ChevronDownIcon className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-neutral-500">
        <p>
          Showing{" "}
          <span className="font-medium text-neutral-800">
            {filtered.length === 0
              ? 0
              : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filtered.length
                )}`}
          </span>{" "}
          of <span className="font-medium text-neutral-800">{filtered.length}</span> bookings
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer text-xs"
            aria-label="Previous Page"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentPage === pageNum
                  ? "bg-[#1b3b36] text-white shadow-xs"
                  : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-7 h-7 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer text-xs"
            aria-label="Next Page"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
