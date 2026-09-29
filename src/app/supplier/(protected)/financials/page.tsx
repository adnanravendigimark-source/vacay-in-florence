import type { Metadata } from "next";
import { requireSupplier } from "@/lib/require-user";
import { getSupplierFinancials } from "@/lib/data/supplier/financials";
import { PageHeader, Badge } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Financials | Supplier",
  robots: { index: false, follow: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function SupplierFinancialsPage() {
  const supplier = await requireSupplier("/supplier/financials");
  const { summary, pendingItems, payoutHistory } = await getSupplierFinancials(supplier.supplierId);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Financials"
        description="Real-time sales, earnings, and payout history — computed directly from your confirmed bookings."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total sales</p>
          <p className="mt-2 font-display text-2xl font-medium text-neutral-900">{priceFormatter.format(summary.totalSales)}</p>
          <p className="mt-1 text-xs text-neutral-500">Confirmed bookings, gross</p>
        </div>
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total earnings</p>
          <p className="mt-2 font-display text-2xl font-medium text-neutral-900">{priceFormatter.format(summary.totalEarnings)}</p>
          <p className="mt-1 text-xs text-neutral-500">After {Math.round(summary.commissionRate * 100)}% platform commission</p>
        </div>
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Paid out</p>
          <p className="mt-2 font-display text-2xl font-medium text-neutral-900">{priceFormatter.format(summary.totalPaidOut)}</p>
          <p className="mt-1 text-xs text-neutral-500">Lifetime, marked paid by admin</p>
        </div>
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Pending payout</p>
          <p className="mt-2 font-display text-2xl font-medium text-neutral-900">{priceFormatter.format(summary.pendingPayout)}</p>
          <p className="mt-1 text-xs text-neutral-500">{pendingItems.length} unpaid booking{pendingItems.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <h2 className="font-display text-base font-medium text-neutral-900">Pending bookings</h2>
          {pendingItems.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">Nothing pending — every confirmed booking has been paid out.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0ECE6]">
              {pendingItems.map((item) => (
                <li key={item.orderItemId} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">{item.productTitle}</p>
                    <p className="text-xs text-neutral-500">{item.date}</p>
                  </div>
                  <span className="text-sm font-medium text-neutral-900">{priceFormatter.format(item.earnedAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
          <h2 className="font-display text-base font-medium text-neutral-900">Payout history</h2>
          {payoutHistory.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No payouts recorded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0ECE6]">
              {payoutHistory.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{priceFormatter.format(p.amount)}</p>
                    {p.notes ? <p className="text-xs text-neutral-500">{p.notes}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={p.status === "paid" ? "success" : "warning"}>{p.status}</Badge>
                    <span className="text-xs text-neutral-500">
                      {dateFormatter.format(p.paidAt ?? p.createdAt)}
                    </span>
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
