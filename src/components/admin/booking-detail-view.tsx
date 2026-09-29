"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AdminOrderDetail, OrderStatus } from "@/lib/data/admin/bookings";
import { setOrderStatusAction } from "@/app/admin/(protected)/bookings/actions";
import { useToast } from "@/components/admin/ui";

function ArrowLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function MailIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function PrinterIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function CopyIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatPrice(amount: number, currency: string = "EUR") {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}

function formatFullDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Confirmed & Active
        </span>
      );
    case "pending_payment":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Payment
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          Cancelled
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Failed
        </span>
      );
  }
}

export function BookingDetailView({ order }: { order: AdminOrderDetail }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const handleUpdateStatus = (nextStatus: OrderStatus) => {
    startTransition(async () => {
      const result = await setOrderStatusAction(order.id, nextStatus);
      if (!result.success) {
        showToast(result.error ?? "Could not update status.", "error");
      } else {
        showToast(`Order status updated to ${nextStatus}`, "success");
        router.refresh();
      }
    });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    showToast("Order ID copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const initial = order.customerName.trim().charAt(0).toUpperCase() || "C";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#1b3b36] transition p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer"
          >
            <ArrowLeftIcon />
            <span>Bookings</span>
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="font-mono text-xs font-semibold text-neutral-900">
            #{order.id.substring(0, 8)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-3 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <PrinterIcon />
            <span>Print Receipt</span>
          </button>

          {order.customerEmail && (
            <a
              href={`mailto:${order.customerEmail}?subject=Regarding Your VACAY Florence Booking #${order.id.substring(0, 8)}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <MailIcon />
              <span>Email Customer</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. Order Summary Banner */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                Order #{order.id.substring(0, 8)}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Placed on {formatFullDate(order.createdAt)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Grand Total
            </span>
            <span className="text-2xl font-bold text-neutral-900 block mt-0.5">
              {formatPrice(order.totalAmount, order.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Pricing Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booked Items Card */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">
                Booked Items ({order.items.length})
              </h2>
            </div>

            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Item Image */}
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/60">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt || item.productTitle}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {item.productTitle}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                        🗓 Date: {item.date}
                      </p>

                      {/* Participants breakdown */}
                      <div className="mt-2 space-y-1">
                        {item.participants.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-neutral-100 text-[11px] font-semibold text-neutral-700">
                              {p.quantity}x
                            </span>
                            <span>{p.optionName}</span>
                            <span className="text-neutral-400">
                              ({formatPrice(p.unitPriceAmount, item.currency)} each)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Item Subtotal</span>
                      <span className="font-bold text-neutral-900">
                        {formatPrice(item.subtotalAmount, item.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Calculation Summary Card */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">Payment Summary</h2>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Items Total</span>
              <span className="font-medium text-neutral-900">
                {formatPrice(order.totalAmount, order.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Booking & Platform Fees</span>
              <span className="font-medium text-emerald-700">Included</span>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-sm">
              <span className="font-bold text-neutral-900">Total Amount Paid / Owed</span>
              <span className="font-bold text-base text-neutral-900">
                {formatPrice(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>

          {/* Customer Special Notes / Instructions */}
          {order.notes && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-2">
              <h2 className="text-sm font-bold text-neutral-900">Customer Note</h2>
              <p className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-relaxed italic">
                &quot;{order.notes}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Customer Details & Order Control */}
        <div className="space-y-6">
          {/* Customer Details Card */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900">Customer</h2>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1b3b36] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{order.customerName}</p>
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-xs text-neutral-500 hover:text-[#1b3b36] hover:underline flex items-center gap-1 mt-0.5 truncate"
                >
                  <MailIcon />
                  <span>{order.customerEmail}</span>
                </a>
                {order.customerPhone && (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-xs text-neutral-500 hover:text-[#1b3b36] hover:underline flex items-center gap-1 mt-1"
                  >
                    <PhoneIcon />
                    <span>{order.customerPhone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Status Management Card */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3.5">
            <h2 className="text-sm font-bold text-neutral-900">Update Status</h2>
            <p className="text-xs text-neutral-500">
              Manual administrative status override for this reservation.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isPending || order.status === "confirmed"}
                onClick={() => handleUpdateStatus("confirmed")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  order.status === "confirmed"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                }`}
              >
                ✓ Confirmed
              </button>

              <button
                type="button"
                disabled={isPending || order.status === "pending_payment"}
                onClick={() => handleUpdateStatus("pending_payment")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  order.status === "pending_payment"
                    ? "bg-amber-50 text-amber-800 border-amber-300 font-bold"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200"
                }`}
              >
                ⏳ Pending
              </button>

              <button
                type="button"
                disabled={isPending || order.status === "cancelled"}
                onClick={() => handleUpdateStatus("cancelled")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  order.status === "cancelled"
                    ? "bg-neutral-200 text-neutral-800 border-neutral-400 font-bold"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                ⏸ Cancelled
              </button>

              <button
                type="button"
                disabled={isPending || order.status === "failed"}
                onClick={() => handleUpdateStatus("failed")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  order.status === "failed"
                    ? "bg-rose-50 text-rose-800 border-rose-300 font-bold"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200"
                }`}
              >
                ✕ Failed
              </button>
            </div>
          </div>

          {/* Order Metadata & Identifier */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h2 className="text-sm font-bold text-neutral-900">Order Metadata</h2>

            <div className="space-y-2">
              <div>
                <span className="text-neutral-400 block text-[11px]">Full Order UUID</span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-mono text-neutral-700 truncate">{order.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
                    title="Copy UUID"
                  >
                    {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <CopyIcon />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">Created At</span>
                <span className="text-neutral-700 block mt-0.5">{formatFullDate(order.createdAt)}</span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">Last Updated</span>
                <span className="text-neutral-700 block mt-0.5">{formatFullDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
