"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { removeCartItemAction, updateCartItemAction } from "@/app/cart/actions";
import type { CartLineItem } from "@/lib/data/cart";

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export function CartItemCard({ item }: { item: CartLineItem }) {
  const initialQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const opt of item.availableOptions) map[opt.id] = 0;
    for (const p of item.participants) map[p.optionId] = p.quantity;
    return map;
  }, [item.availableOptions, item.participants]);

  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);
  const [dirty, setDirty] = useState(false);

  // updateCartItemAction is a fire-and-forget server action (no
  // useActionState), so nothing told this component when a submitted
  // update actually landed — the "Update" button just stayed visible
  // forever after the first edit, even once the save succeeded. Once
  // revalidatePath brings back fresh server data, item.participants
  // changes and initialQuantities is recomputed to a new object; noticing
  // that during render (React's recommended way to reset state when a
  // prop changes, rather than an effect) is what tells us the in-flight
  // edit is now reflected, so we can drop back out of the "dirty" state.
  const [prevInitialQuantities, setPrevInitialQuantities] = useState(initialQuantities);
  if (initialQuantities !== prevInitialQuantities) {
    setPrevInitialQuantities(initialQuantities);
    setQuantities(initialQuantities);
    setDirty(false);
  }

  const liveTotal = item.availableOptions.reduce((sum, o) => sum + o.priceAmount * (quantities[o.id] ?? 0), 0);

  function updateQuantity(optionId: string, delta: number) {
    setQuantities((prev) => ({ ...prev, [optionId]: Math.max(0, Math.min(20, (prev[optionId] ?? 0) + delta)) }));
    setDirty(true);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-stone/60 bg-white p-4 sm:flex-row sm:p-5">
      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-cream-deep sm:h-28 sm:w-40">
        <Image src={item.image.src} alt={item.image.alt} fill sizes="160px" className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <Link href={`/experiences/${item.productSlug}`} className="font-display text-lg font-medium text-ink hover:text-terracotta">
              {item.productTitle}
            </Link>
            <p className="mt-0.5 text-sm text-ink-faint">{dateFormatter.format(new Date(item.date + "T00:00:00"))}</p>
          </div>
          <form action={removeCartItemAction}>
            <input type="hidden" name="itemId" value={item.id} />
            <button type="submit" className="text-sm font-medium text-ink-faint underline-offset-2 hover:text-terracotta hover:underline">
              Remove
            </button>
          </form>
        </div>

        <form action={updateCartItemAction} className="flex flex-col gap-3">
          <input type="hidden" name="itemId" value={item.id} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {item.availableOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between gap-2 text-sm">
                <div>
                  <span className="text-ink">{option.name}</span>
                  <span className="ml-1.5 text-ink-faint">{priceFormatter.format(option.priceAmount)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Decrease ${option.name}`}
                    onClick={() => updateQuantity(option.id, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-dark text-ink-soft transition hover:bg-cream-deep"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-medium text-ink">{quantities[option.id] ?? 0}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${option.name}`}
                    onClick={() => updateQuantity(option.id, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-dark text-ink-soft transition hover:bg-cream-deep"
                  >
                    +
                  </button>
                  <input type="hidden" name={`option:${option.id}`} value={quantities[option.id] ?? 0} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-stone pt-3">
            <span className="text-sm text-ink-soft">Subtotal</span>
            <div className="flex items-center gap-3">
              <span className="font-display text-lg font-medium text-ink">{priceFormatter.format(liveTotal)}</span>
              {dirty ? (
                <button type="submit" className="rounded-full bg-cream-deep px-4 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-stone">
                  Update
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
