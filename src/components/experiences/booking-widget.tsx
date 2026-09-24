"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { addToCartAction, type AddToCartState } from "@/app/(public)/experiences/[slug]/actions";
import type { ProductOptionSummary } from "@/lib/data/products";
import { notifyCartUpdated } from "@/lib/cart-events";

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function maxDateIso() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}

export function BookingWidget({ productSlug, options }: { productSlug: string; options: ProductOptionSummary[] }) {
  const [date, setDate] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(options.map((o) => [o.id, 0])),
  );

  const initialState: AddToCartState = { status: "idle" };
  const [state, formAction, isPending] = useActionState(addToCartAction.bind(null, productSlug), initialState);

  // The header's cart badge only refetches on pathname change, which this
  // same-page form submit never triggers — tell it directly.
  useEffect(() => {
    if (state.status === "success") {
      notifyCartUpdated();
    }
  }, [state]);

  const total = useMemo(
    () => options.reduce((sum, o) => sum + o.priceAmount * (quantities[o.id] ?? 0), 0),
    [options, quantities],
  );
  const totalParticipants = Object.values(quantities).reduce((a, b) => a + b, 0);

  function updateQuantity(optionId: string, delta: number) {
    setQuantities((prev) => ({ ...prev, [optionId]: Math.max(0, Math.min(20, (prev[optionId] ?? 0) + delta)) }));
  }

  return (
    <form
      action={formAction}
      className="sticky top-28 rounded-2xl border border-stone-dark bg-white p-5 shadow-[var(--shadow-card)]"
    >
      <label htmlFor="booking-date" className="text-sm font-semibold text-ink">
        Select a date
      </label>
      <input
        id="booking-date"
        name="date"
        type="date"
        required
        min={todayIso()}
        max={maxDateIso()}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mt-2 w-full rounded-xl border border-stone-dark px-3 py-2.5 text-sm text-ink"
      />

      <div className="mt-5 space-y-3">
        {options.map((option) => (
          <div key={option.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">{option.name}</p>
              <p className="text-xs text-ink-faint">{priceFormatter.format(option.priceAmount)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease ${option.name}`}
                onClick={() => updateQuantity(option.id, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-dark text-ink-soft transition hover:bg-cream-deep"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium text-ink" aria-live="polite">
                {quantities[option.id] ?? 0}
              </span>
              <button
                type="button"
                aria-label={`Increase ${option.name}`}
                onClick={() => updateQuantity(option.id, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-dark text-ink-soft transition hover:bg-cream-deep"
              >
                +
              </button>
              <input type="hidden" name={`option:${option.id}`} value={quantities[option.id] ?? 0} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-stone pt-4">
        <span className="text-sm text-ink-soft">Total</span>
        <span className="font-display text-xl font-medium text-ink">{priceFormatter.format(total)}</span>
      </div>

      <button
        type="submit"
        disabled={isPending || totalParticipants === 0 || !date}
        className="mt-4 w-full rounded-full bg-terracotta px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add to Cart"}
      </button>

      {state.status === "error" ? (
        <p role="alert" className="mt-3 text-sm text-terracotta-dark">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p role="status" className="mt-3 text-sm text-cypress">
          {state.message}{" "}
          <a href="/cart" className="font-semibold underline">
            View cart
          </a>
        </p>
      ) : null}

      <p className="mt-3 text-center text-xs text-ink-faint">Free cancellation up to 24 hours before</p>
    </form>
  );
}
