import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDashboardData } from "@/lib/data/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | VACAY Florence",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const STATUS_COLORS: Record<string, { bar: string; dot: string; badgeBg: string; badgeText: string }> = {
  confirmed: { bar: "#2b0934", dot: "#2b0934", badgeBg: "#FAF5FC", badgeText: "#2b0934" },
  pending_payment: { bar: "#D9A441", dot: "#D9A441", badgeBg: "#FEF7E6", badgeText: "#B47818" },
  cancelled: { bar: "#D94F3D", dot: "#D94F3D", badgeBg: "#FDF0ED", badgeText: "#D94F3D" },
  failed: { bar: "#B23A2C", dot: "#B23A2C", badgeBg: "#FDF0ED", badgeText: "#D94F3D" },
};
const DEFAULT_STATUS_COLOR = { bar: "#8A8A8A", dot: "#8A8A8A", badgeBg: "#F0ECE6", badgeText: "#6B6B6B" };

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const isUp = pct >= 0;
  return (
    <span className={`text-[11px] font-semibold ${isUp ? "text-emerald-600" : "text-[#D94F3D]"}`}>
      {isUp ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let value = seconds;
  for (const [amount, unit] of units) {
    if (value < amount) {
      const rounded = Math.floor(value);
      return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`;
    }
    value /= amount;
  }
  return dateFormatter.format(date);
}

function formatAction(action: string, entityType: string): string {
  const [, verb] = action.includes(".") ? action.split(".") : [null, action];
  const verbLabel: Record<string, string> = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    approve: "Approved",
    reject: "Rejected",
    publish: "Published",
  };
  const label = (verb && verbLabel[verb]) || "Updated";
  return `${label} a ${entityType}`;
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  const maxStatusCount = Math.max(1, ...data.bookingsByStatus.map((s) => s.count));

  return (
    <div className="space-y-6 sm:space-y-7 max-w-[1600px] mx-auto">
      {/* ================================================================= */}
      {/* 1. DASHBOARD TITLE */}
      {/* ================================================================= */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs sm:text-[13px] text-neutral-500 mt-1">
          Overview of your website, bookings and overall performance.
        </p>
      </div>

      {/* ================================================================= */}
      {/* 2. STAT CARDS ROW & MANAGE PLATFORM BANNER */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {/* Metric 1: Total Bookings */}
          <div className="rounded-3xl bg-white border border-[#EAE6DF] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="mt-3.5">
              <p className="text-xs font-medium text-neutral-500">Total Bookings</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-2xl sm:text-[26px] font-medium text-neutral-900 tracking-tight">
                  {numberFormatter.format(data.bookings.value)}
                </span>
                <TrendBadge pct={data.bookings.trendPct} />
              </div>
              <p className="text-[10.5px] text-neutral-400 mt-1">vs. previous 30 days</p>
            </div>
          </div>

          {/* Metric 2: Total Revenue */}
          <div className="rounded-3xl bg-white border border-[#EAE6DF] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <div className="mt-3.5">
              <p className="text-xs font-medium text-neutral-500">Total Revenue</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-2xl sm:text-[26px] font-medium text-neutral-900 tracking-tight">
                  {priceFormatter.format(data.revenue.value)}
                </span>
                <TrendBadge pct={data.revenue.trendPct} />
              </div>
              <p className="text-[10.5px] text-neutral-400 mt-1">from confirmed bookings</p>
            </div>
          </div>

          {/* Metric 3: Total Customers */}
          <div className="rounded-3xl bg-white border border-[#EAE6DF] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className="mt-3.5">
              <p className="text-xs font-medium text-neutral-500">Total Customers</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-2xl sm:text-[26px] font-medium text-neutral-900 tracking-tight">
                  {numberFormatter.format(data.customers.value)}
                </span>
                <TrendBadge pct={data.customers.trendPct} />
              </div>
              <p className="text-[10.5px] text-neutral-400 mt-1">vs. previous 30 days</p>
            </div>
          </div>

          {/* Metric 4: Total Experiences */}
          <div className="rounded-3xl bg-white border border-[#EAE6DF] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div className="mt-3.5">
              <p className="text-xs font-medium text-neutral-500">Total Experiences</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-2xl sm:text-[26px] font-medium text-neutral-900 tracking-tight">
                  {numberFormatter.format(data.totalExperiences)}
                </span>
              </div>
              <p className="text-[10.5px] text-neutral-400 mt-1">live in your catalog</p>
            </div>
          </div>
        </div>

        {/* Right: Manage Your Travel Platform Banner */}
        <div className="lg:col-span-4 xl:col-span-3 relative rounded-3xl overflow-hidden p-6 text-white shadow-xs flex flex-col justify-between min-h-[200px]">
          <Image
            src="/images/florence-hero.jpg"
            alt="Florence cathedral panorama"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />

          <div className="relative z-10">
            <span className="inline-block text-[9.5px] font-bold tracking-widest uppercase text-neutral-300">
              VACAY IN FLORENCE
            </span>
            <h3 className="font-display text-lg sm:text-xl font-medium mt-1 leading-snug text-white">
              Manage Your<br />Travel Platform
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-200 mt-1.5 leading-relaxed max-w-[240px]">
              Edit content, update experiences, and keep your website up to date &mdash; all in one place.
            </p>
          </div>

          <div className="relative z-10 mt-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-[#2b0934] hover:bg-[#3d0d4a] text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm hover:shadow border border-white/10"
            >
              <span>Go to Public Website</span>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. RECENT BOOKINGS & QUICK ACTIONS */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Recent Bookings (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-[#EAE6DF] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M3 15h18M9 3v18" />
                  </svg>
                </div>
                <h2 className="font-display text-base sm:text-lg font-medium text-neutral-900">Recent Bookings</h2>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-neutral-600 hover:text-[#2b0934] transition flex items-center gap-1 group"
              >
                <span>View all</span>
                <span className="group-hover:translate-x-0.5 transition">&rarr;</span>
              </Link>
            </div>

            {data.recentOrders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-neutral-700">No bookings yet</p>
                <p className="text-xs text-neutral-400 mt-1">Real bookings will show up here as customers book.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 mt-1">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Experience</th>
                      <th className="py-3 px-3 whitespace-nowrap">Date</th>
                      <th className="py-3 px-3 whitespace-nowrap">Status</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE6]">
                    {data.recentOrders.map((order) => {
                      const status = STATUS_COLORS[order.status] ?? DEFAULT_STATUS_COLOR;
                      return (
                        <tr key={order.id} className="hover:bg-[#FAF8F5]/60 transition">
                          <td className="py-3.5 px-3 min-w-[170px]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                {getInitials(order.customerName)}
                              </div>
                              <div className="min-w-0 max-w-[130px]">
                                <p className="font-semibold text-neutral-900 truncate leading-tight">{order.customerName}</p>
                                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{order.customerEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 min-w-[190px]">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-neutral-100 border border-[#EAE6DF]">
                                <Image src={order.image.src} alt={order.image.alt} fill className="object-cover" sizes="32px" />
                              </div>
                              <span className="font-medium text-neutral-800 truncate max-w-[150px]">
                                {order.productTitle}
                                {order.extraItemCount > 0 ? ` +${order.extraItemCount} more` : ""}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 min-w-[110px] whitespace-nowrap">
                            <p className="text-neutral-700 font-medium">{dateFormatter.format(order.createdAt)}</p>
                            {order.participantCount > 0 ? (
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                {order.participantCount} {order.participantCount === 1 ? "person" : "people"}
                              </p>
                            ) : null}
                          </td>
                          <td className="py-3.5 px-3 min-w-[120px] whitespace-nowrap">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border border-transparent"
                              style={{ backgroundColor: status.badgeBg, color: status.badgeText }}
                            >
                              {order.statusLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 min-w-[80px] text-right whitespace-nowrap font-semibold text-neutral-900 text-sm">
                            {priceFormatter.format(order.totalAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-[#EAE6DF] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#F0ECE6]">
              <div className="w-8 h-8 rounded-lg bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h2 className="font-display text-base sm:text-lg font-medium text-neutral-900">Quick Actions</h2>
            </div>

            <div className="space-y-2 mt-3.5">
              {[
                {
                  href: "/admin/experiences/new",
                  title: "Add Experience",
                  subtitle: "Create a new experience",
                  icon: (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </>
                  ),
                },
                {
                  href: "/admin/categories",
                  title: "Add Category",
                  subtitle: "Add a new category",
                  icon: (
                    <>
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </>
                  ),
                },
                {
                  href: "/admin/bookings",
                  title: "Manage Bookings",
                  subtitle: "View and manage bookings",
                  icon: (
                    <>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </>
                  ),
                },
                {
                  href: "/admin/blog",
                  title: "Create Blog Post",
                  subtitle: "Write a new blog post",
                  icon: (
                    <>
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </>
                  ),
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#F0ECE6] hover:border-[#2b0934]/30 hover:bg-[#FAF8F5] transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                        {action.icon}
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 leading-tight group-hover:text-[#2b0934] transition">{action.title}</p>
                      <p className="text-[10.5px] text-neutral-400 mt-0.5">{action.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 group-hover:text-[#2b0934] group-hover:translate-x-0.5 transition">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. BOOKINGS BY STATUS & RECENT ACTIVITY */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Bookings by Status (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-[#EAE6DF] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#F0ECE6]">
            <div className="w-8 h-8 rounded-lg bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </div>
            <h2 className="font-display text-base sm:text-lg font-medium text-neutral-900">Bookings by Status</h2>
          </div>

          {data.bookingsByStatus.length === 0 ? (
            <p className="text-xs text-neutral-400 py-8 text-center">No bookings yet.</p>
          ) : (
            <div className="space-y-3.5 mt-4">
              {data.bookingsByStatus.map((row) => {
                const color = STATUS_COLORS[row.status] ?? DEFAULT_STATUS_COLOR;
                const widthPct = Math.max(6, Math.round((row.count / maxStatusCount) * 100));
                return (
                  <div key={row.status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-2 text-neutral-700">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color.dot }} />
                        <span>{row.label}</span>
                      </span>
                      <span className="font-semibold text-neutral-900">{row.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F0ECE6] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${widthPct}%`, backgroundColor: color.bar }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-[#EAE6DF] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 pb-4 sm:pb-5 border-b border-[#F0ECE6]">
            <div className="w-8 h-8 rounded-lg bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="font-display text-base sm:text-lg font-medium text-neutral-900">Recent Activity</h2>
          </div>

          {data.recentActivity.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-neutral-700">No activity yet</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Admin actions like adding an experience, approving a supplier, or publishing a blog post will show
                up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {data.recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-800 leading-snug">
                      {formatAction(entry.action, entry.entityType)}
                      {entry.actorName ? (
                        <>
                          {" "}
                          &mdash; <span className="font-semibold text-neutral-900">{entry.actorName}</span>
                        </>
                      ) : null}
                    </p>
                    <p className="text-[10.5px] text-neutral-400 mt-0.5">{timeAgo(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
