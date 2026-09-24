import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { getOrdersForUser } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Account Overview | VACAY Florence",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

const STATUS_LABEL: Record<string, { label: string; tone: "green" | "amber" | "red" }> = {
  confirmed: { label: "Confirmed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
  failed: { label: "Failed", tone: "red" },
  pending_payment: { label: "Pending", tone: "amber" },
};

export default async function AccountOverviewPage() {
  const sessionUser = await requireUser("/account");
  const orders = await getOrdersForUser(sessionUser.id);
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* RECENT BOOKINGS & DISCOVER PROMO */}
      {/* ================================================================= */}
      {/* Recent Bookings (Full Width, Spacious & Clean) */}
      <div className="rounded-3xl bg-white border border-stone p-6 sm:p-8 shadow-[0_4px_25px_rgba(43,9,52,0.03)]">
        <div className="flex items-center justify-between pb-6 border-b border-stone">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium text-ink tracking-tight">
              Recent Bookings
            </h2>
            <p className="text-xs sm:text-[13px] text-ink-faint mt-1">
              {orders.length > 0
                ? `${orders.length} booking${orders.length === 1 ? "" : "s"} total`
                : "Your latest travel experiences"}
            </p>
          </div>
          {orders.length > 0 ? (
            <Link
              href="/account/bookings"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#2b0934] hover:text-[#850b9e] transition-colors"
            >
              <span>View all bookings</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          ) : null}
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand mb-3.5">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-medium text-ink">No bookings yet</h3>
            <p className="text-xs sm:text-[13px] text-ink-soft mt-1.5 max-w-sm mx-auto leading-relaxed">
              Once you book an experience, it&apos;ll show up here with live status updates.
            </p>
            <div className="mt-5">
              <Link
                href="/experiences"
                className="inline-flex items-center gap-2 bg-[#2b0934] hover:bg-[#3d0d4a] text-white text-xs sm:text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-150 shadow-sm hover:shadow"
              >
                <span>Browse Experiences</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-stone">
            {recentOrders.map((order) => {
              const firstItem = order.items[0];
              const guestsCount = order.items.reduce(
                (sum, item) => sum + item.participants.reduce((s, p) => s + (p.quantity || 0), 0),
                0,
              );
              const status = STATUS_LABEL[order.status] ?? { label: order.status, tone: "amber" as const };

              return (
                <div
                  key={order.id}
                  className="py-5 sm:py-6 first:pt-4 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                >
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                    <div className="relative w-24 h-18 sm:w-32 sm:h-22 rounded-2xl overflow-hidden shrink-0 bg-stone/40 shadow-2xs">
                      <Image
                        src={firstItem?.image.src ?? "/images/florence-hero.jpg"}
                        alt={firstItem?.image.alt ?? "Florence, Italy"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 96px, 128px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h3 className="font-display font-medium text-base sm:text-[17px] text-ink truncate group-hover:text-brand transition-colors">
                          {firstItem?.productTitle ?? "Booking"}
                          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                        </h3>
                        <span
                          className={`md:hidden inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            status.tone === "green"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : status.tone === "amber"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-[12.5px] text-ink-faint">
                        <span className="inline-flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-ink-faint/80">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{dateFormatter.format(order.createdAt)}</span>
                        </span>
                        {guestsCount > 0 ? (
                          <>
                            <span className="text-stone-dark">&bull;</span>
                            <span className="inline-flex items-center gap-1.5">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-ink-faint/80">
                                <circle cx="12" cy="7" r="4" />
                                <path d="M5.5 21a6.5 6.5 0 0113 0" />
                              </svg>
                              <span>{guestsCount} participant{guestsCount > 1 ? "s" : ""}</span>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 sm:gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-stone/60">
                    <div className="md:text-right">
                      <span
                        className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1 ${
                          status.tone === "green"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : status.tone === "amber"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {status.label}
                      </span>
                      <p className="font-display font-medium text-base sm:text-lg text-ink leading-tight">
                        {priceFormatter.format(order.totalAmount)}
                      </p>
                    </div>
                    <Link
                      href={`/account/bookings/${order.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#2b0934] hover:bg-[#3d0d4a] text-white text-xs sm:text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-150 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>View Details</span>
                      <span className="text-sm">&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Horizontal Support Banner */}
      <div className="rounded-3xl bg-white border border-stone p-6 sm:p-7 shadow-[0_4px_25px_rgba(43,9,52,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.8]">
              <path d="M3 18v-6a9 9 0 0118 0v6" />
              <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-medium text-ink">Need help with your experiences?</h3>
            <p className="text-xs sm:text-[13px] text-ink-soft mt-0.5 leading-relaxed">
              Our team is here to assist you with any questions, schedule changes, or requests.
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 border border-stone-dark text-ink text-xs sm:text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-stone/30 hover:border-stone-dark transition shrink-0"
        >
          <span>Contact Support</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
