"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { removeCartItemAction, updateCartItemAction } from "@/app/(public)/cart/actions";
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
  const [isSaving, startTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const [prevInitialQuantities, setPrevInitialQuantities] = useState(initialQuantities);
  if (initialQuantities !== prevInitialQuantities) {
    setPrevInitialQuantities(initialQuantities);
    setQuantities(initialQuantities);
  }

  const liveTotal = item.availableOptions.reduce((sum, o) => sum + o.priceAmount * (quantities[o.id] ?? 0), 0);

  // Persists a full quantity map immediately — every stepper click and
  // per-option removal saves itself server-side right away, so there's
  // nothing for the visitor to remember to confirm.
  function commit(nextQuantities: Record<string, number>) {
    setQuantities(nextQuantities);
    const formData = new FormData();
    formData.set("itemId", item.id);
    for (const [optionId, qty] of Object.entries(nextQuantities)) {
      formData.set(`option:${optionId}`, String(qty));
    }
    startTransition(async () => {
      await updateCartItemAction(formData);
    });
  }

  function updateQuantity(optionId: string, delta: number) {
    commit({ ...quantities, [optionId]: Math.max(0, Math.min(20, (quantities[optionId] ?? 0) + delta)) });
  }

  function removeOption(optionId: string) {
    commit({ ...quantities, [optionId]: 0 });
  }

  // Removing the whole line is destructive and can't be undone from the
  // cart, so it's gated behind an explicit confirm dialog rather than
  // firing on the first click.
  function confirmRemoveLine() {
    const formData = new FormData();
    formData.set("itemId", item.id);
    startRemoveTransition(async () => {
      await removeCartItemAction(formData);
    });
  }

  // Close the confirm dialog on Escape, matching the auth modal elsewhere
  // in the app.
  useEffect(() => {
    if (!showRemoveConfirm) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowRemoveConfirm(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showRemoveConfirm]);

  const formattedDate = dateFormatter.format(new Date(item.date + "T00:00:00"));

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-md">
      {/* Top section: Thumbnail + Details */}
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Experience Thumbnail */}
        <div className="relative aspect-[4/3] sm:aspect-square w-full sm:w-44 shrink-0 overflow-hidden rounded-xl bg-stone-100">
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            sizes="(min-width: 640px) 180px, 100vw"
            className="object-cover"
          />
        </div>

        {/* Content Details */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            {/* Title */}
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/experiences/${item.productSlug}`}
                className="font-display text-lg sm:text-xl font-bold leading-snug text-neutral-900 transition-colors hover:text-terracotta"
              >
                {item.productTitle}
              </Link>

              {/* One-click removal of the whole cart line asks for
                  confirmation first — distinct from the per-option trash
                  icons below, which still save immediately via commit(),
                  since those are easy to undo by stepping the count back
                  up. Actual deletion is wired to removeCartItemAction
                  (already scoped to this visitor's own cart id
                  server-side), invoked from confirmRemoveLine(). */}
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(true)}
                className="shrink-0 text-xs font-semibold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                aria-label={`Remove ${item.productTitle} from cart`}
              >
                Remove
              </button>
            </div>

            {/* Date and Location Row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#a813c9] fill-none stroke-current stroke-2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                  <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#a813c9] fill-none stroke-current stroke-2">
                  <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>{item.location || "Florence, Italy"}</span>
              </div>
            </div>
          </div>

          {/* Options & Steppers — each click saves immediately */}
          <div className="mt-4 space-y-3">
            <div className="space-y-2.5">
              {item.availableOptions.map((option) => {
                const qty = quantities[option.id] ?? 0;
                return (
                  <div key={option.id} className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-neutral-800">{option.name}</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-semibold text-neutral-900 w-16 text-right">
                        {priceFormatter.format(option.priceAmount)}
                      </span>

                      {/* Stepper Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease ${option.name}`}
                          disabled={isSaving}
                          onClick={() => updateQuantity(option.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-neutral-50 text-neutral-600 transition hover:bg-stone-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          &minus;
                        </button>
                        <span className="w-5 text-center font-bold text-neutral-900">{qty}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${option.name}`}
                          disabled={isSaving}
                          onClick={() => updateQuantity(option.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-neutral-50 text-neutral-600 transition hover:bg-stone-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          &#43;
                        </button>
                      </div>

                      {/* Trash can delete icon button */}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => removeOption(option.id)}
                        aria-label={`Remove ${option.name}`}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Badges Row */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-medium text-neutral-600">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#a813c9] fill-none stroke-current stroke-2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Skip-the-line entry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#a813c9] fill-none stroke-current stroke-2">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          <span>Audio guide included</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#a813c9] fill-none stroke-current stroke-2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Free cancellation up to 24 hours</span>
        </div>
      </div>

      {/* Bottom Subtotal Row */}
      <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-end gap-3">
        <span className="text-xs font-semibold text-neutral-500">Subtotal</span>
        <span className="font-display text-2xl font-bold text-neutral-900">
          {priceFormatter.format(liveTotal)}
        </span>
      </div>

      {/* Remove-line confirmation dialog */}
      {showRemoveConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-item-dialog-title"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => !isRemoving && setShowRemoveConfirm(false)}
          />

          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6">
            <h2 id="remove-item-dialog-title" className="font-display text-lg font-bold text-neutral-900">
              Remove this experience?
            </h2>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              {item.productTitle} will be removed from your cart. This can&apos;t be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => setShowRemoveConfirm(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-stone-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={confirmRemoveLine}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRemoving ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
