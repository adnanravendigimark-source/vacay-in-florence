import type { Metadata } from "next";
import Link from "next/link";
import { requireSupplier } from "@/lib/require-user";
import { getSupplierDashboardData } from "@/lib/data/supplier/dashboard";
import { PageHeader, Badge } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Supplier Dashboard",
  robots: { index: false, follow: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  confirmed: "success",
  pending_payment: "warning",
  cancelled: "danger",
  failed: "danger",
  live: "success",
  pending_review: "warning",
  draft: "neutral",
  paused: "neutral",
  rejected: "danger",
  changes_requested: "warning",
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="mt-2 font-display text-2xl font-medium text-neutral-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export default async function SupplierDashboardPage() {
  const supplier = await requireSupplier("/supplier/dashboard");
  const data = await getSupplierDashboardData(supplier.supplierId);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title={`Welcome back, ${supplier.supplierName}`}
        description="A real-time overview of your experiences, bookings, and earnings."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Experiences"
          value={String(data.totalExperiences)}
          hint={`${data.publishedExperiences} live · ${data.pendingExperiences} pending review`}
        />
        <StatCard
          label="Total bookings"
          value={String(data.totalBookings)}
          hint={`${data.upcomingBookings} upcoming (confirmed)`}
        />
        <StatCard
          label="Total sales"
          value={priceFormatter.format(data.totalRevenue)}
          hint="Confirmed bookings, gross"
        />
        <StatCard
          label="Estimated earnings"
          value={priceFormatter.format(data.estimatedEarnings)}
          hint={`After ${Math.round(data.commissionRate * 100)}% platform commission`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-medium text-neutral-900">Recent bookings</h2>
            <Link href="/supplier/bookings" className="text-xs font-medium text-cypress hover:underline">
              View all
            </Link>
          </div>
          {data.recentBookings.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No bookings yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0ECE6]">
              {data.recentBookings.map((b) => (
                <li key={`${b.orderId}-${b.date}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">{b.productTitle}</p>
                    <p className="text-xs text-neutral-500">
                      {b.customerName} · {b.date}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={STATUS_TONE[b.status] ?? "neutral"}>{b.status.replace("_", " ")}</Badge>
                    <span className="text-sm font-medium text-neutral-900">
                      {new Intl.NumberFormat("en-IE", { style: "currency", currency: b.currency }).format(b.subtotalAmount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-medium text-neutral-900">Recent experience activity</h2>
            <Link href="/supplier/experiences" className="text-xs font-medium text-cypress hover:underline">
              View all
            </Link>
          </div>
          {data.recentExperiences.length === 0 ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-neutral-500">You haven&apos;t created any experiences yet.</p>
              <Link
                href="/supplier/experiences/new"
                className="inline-flex items-center rounded-xl bg-cypress px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Create your first experience
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0ECE6]">
              {data.recentExperiences.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <p className="truncate text-sm font-medium text-neutral-900">{e.title}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={STATUS_TONE[e.status] ?? "neutral"}>{e.status.replace("_", " ")}</Badge>
                    <span className="text-xs text-neutral-500">{dateFormatter.format(e.updatedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
