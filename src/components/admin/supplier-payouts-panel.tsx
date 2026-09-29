"use client";

import { useState, useTransition } from "react";
import { Button, Modal, Field, Input, Textarea, Badge, useToast } from "@/components/admin/ui";
import { recordSupplierPayoutAction } from "@/app/admin/(protected)/suppliers/actions";
import type { SupplierFinancials } from "@/lib/data/supplier/financials";

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function SupplierPayoutsPanel({ supplierId, financials }: { supplierId: string; financials: SupplierFinancials }) {
  const { summary, pendingItems, payoutHistory } = financials;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(summary.pendingPayout.toFixed(2));
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function openModal() {
    setAmount(summary.pendingPayout.toFixed(2));
    setNotes("");
    setOpen(true);
  }

  function submit() {
    const parsedAmount = Number.parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast("Enter a valid payout amount.", "error");
      return;
    }
    startTransition(async () => {
      const result = await recordSupplierPayoutAction(supplierId, parsedAmount, notes);
      if (result.success) {
        showToast("Payout recorded.", "success");
        setOpen(false);
      } else {
        showToast(result.error ?? "Could not record this payout.", "error");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-stone bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Financials & Payouts</h3>
        <Button
          size="sm"
          variant="primary"
          onClick={openModal}
          disabled={pendingItems.length === 0}
          title={pendingItems.length === 0 ? "Nothing pending to pay out" : undefined}
        >
          Record payout
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total sales</p>
          <p className="mt-1 text-lg font-medium text-neutral-900">{priceFormatter.format(summary.totalSales)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Commission</p>
          <p className="mt-1 text-lg font-medium text-neutral-900">{Math.round(summary.commissionRate * 100)}%</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Paid out</p>
          <p className="mt-1 text-lg font-medium text-neutral-900">{priceFormatter.format(summary.totalPaidOut)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Pending payout</p>
          <p className="mt-1 text-lg font-medium text-neutral-900">{priceFormatter.format(summary.pendingPayout)}</p>
        </div>
      </div>

      {pendingItems.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {pendingItems.length} unpaid booking{pendingItems.length === 1 ? "" : "s"}
          </p>
          <ul className="max-h-40 divide-y divide-stone overflow-y-auto rounded-xl border border-stone">
            {pendingItems.map((item) => (
              <li key={item.orderItemId} className="flex items-center justify-between px-3 py-2 text-xs">
                <span className="text-ink">{item.productTitle} — {item.date}</span>
                <span className="font-medium text-ink">{priceFormatter.format(item.earnedAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {payoutHistory.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Payout history</p>
          <ul className="divide-y divide-stone rounded-xl border border-stone">
            {payoutHistory.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-3 py-2 text-xs">
                <div>
                  <p className="text-ink">{priceFormatter.format(p.amount)}</p>
                  {p.notes ? <p className="text-ink-faint">{p.notes}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={p.status === "paid" ? "success" : "warning"}>{p.status}</Badge>
                  <span className="text-ink-faint">{p.paidAt ? dateFormatter.format(p.paidAt) : dateFormatter.format(p.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Record payout"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={isPending}>
              {isPending ? "Saving…" : "Record payout"}
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-ink-faint">
          This marks all {pendingItems.length} currently pending booking{pendingItems.length === 1 ? "" : "s"} for this
          supplier as paid.
        </p>
        <Field label="Amount (EUR)" required>
          <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <div className="mt-4">
          <Field label="Notes">
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional — e.g. bank transfer reference" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
