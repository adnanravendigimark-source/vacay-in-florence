"use client";

import { useState, useMemo, useEffect, useRef, useActionState } from "react";
import { addToCartAction, type AddToCartState } from "@/app/experiences/[slug]/actions";
import type { ProductOptionSummary } from "@/lib/data/products";
import { notifyCartUpdated } from "@/lib/cart-events";

interface SingleExperienceBookingCardProps {
  productSlug: string;
  options: ProductOptionSummary[];
  basePrice?: number;
}

const TIME_SLOTS = [
  "09:00 AM",
  "11:00 AM",
  "01:00 PM",
  "03:00 PM",
  "05:00 PM",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_NAMES = ["M", "T", "W", "T", "F", "S", "S"];

export function SingleExperienceBookingCard({
  productSlug,
  options,
  basePrice = 15.0,
}: SingleExperienceBookingCardProps) {
  // Calendar state: defaults to 2 days from today (the browser's actual
  // current date at load time, since this is a client component).
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Midnight-normalized "today", used to block picking a date in the past.
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Time slot selection
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:00 AM");

  // Ticket tiers are the product's real, per-product options from the
  // database (ProductOptionSummary[] — name + price set per product, e.g.
  // via the admin/CMS), never a fixed Adult/Youth/Child template: two
  // different products can have entirely different tiers and prices, and
  // this renders whatever each one actually has. Only when a product has
  // no configured options at all does this fall back to a single honest
  // 'Standard Ticket' tier at the product's real starting price
  // (basePrice, i.e. product.priceFrom.amount) — never fabricated names
  // or prices.
  const tiers = useMemo(() => {
    if (options.length > 0) {
      return options.map((option, index) => ({
        id: option.id,
        name: option.name,
        price: option.priceAmount,
        isFree: option.priceAmount === 0,
        initialQty: index === 0 ? 1 : 0,
      }));
    }
    return [
      {
        id: "standard",
        name: "Standard Ticket",
        price: basePrice,
        isFree: basePrice === 0,
        initialQty: 1,
      },
    ];
  }, [options, basePrice]);

  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(tiers.map((t) => [t.id, t.initialQty]))
  );

  // Close calendar popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    }
    if (calendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [calendarOpen]);

  // Form submit state
  const initialState: AddToCartState = { status: "idle" };
  const [state, formAction, isPending] = useActionState(
    addToCartAction.bind(null, productSlug),
    initialState
  );

  useEffect(() => {
    if (state.status === "success") {
      notifyCartUpdated();
    }
  }, [state]);

  function updateQty(id: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(15, (prev[id] ?? 0) + delta)),
    }));
  }

  const totalPrice = useMemo(() => {
    return tiers.reduce((sum, tier) => {
      const qty = quantities[tier.id] ?? 0;
      return sum + tier.price * qty;
    }, 0);
  }, [tiers, quantities]);

  const totalTickets = useMemo(() => {
    return Object.values(quantities).reduce((a, b) => a + b, 0);
  }, [quantities]);

  // Formatted date string for input label matching reference: "Thu, 24 Apr 2025"
  const formattedDateString = useMemo(() => {
    const weekday = selectedDate.toLocaleDateString("en-US", { weekday: "short" });
    const day = selectedDate.getDate();
    const month = MONTH_NAMES[selectedDate.getMonth()].slice(0, 3);
    const year = selectedDate.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  }, [selectedDate]);

  // ISO string for server form submission (YYYY-MM-DD)
  const isoDateString = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  // Days in calendar month view
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    // Monday-based indexing: 0 = Mon, 6 = Sun
    let startDayIndex = firstDay.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const totalDays = lastDay.getDate();
    const days: (number | null)[] = [];

    // Empty cells before first day
    for (let i = 0; i < startDayIndex; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [viewYear, viewMonth]);

  function handleSelectCalendarDay(day: number) {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
    setCalendarOpen(false);
  }

  const isAtCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function handlePrevMonth(e: React.MouseEvent) {
    e.stopPropagation();
    if (isAtCurrentMonth) return; // never navigate to a month before today's
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNextMonth(e: React.MouseEvent) {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    /* Card Container: original proportions, just a touch wider (460px -> 500px) */
    <div className="w-full max-w-[500px] rounded-[26px] bg-[#FAF8F5] p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#ECE7DF] text-neutral-900 transition-all select-none">
      {/* Form: reduced vertical spacing from space-y-5 down to space-y-3.5 */}
      <form action={formAction} className="space-y-3.5">
        <input type="hidden" name="date" value={isoDateString} />
        <input type="hidden" name="timeSlot" value={selectedTimeSlot} />

        {/* ------------------------------------------------------------- */}
        {/* 1. Select Date Custom Dropdown (Compact height & padding)     */}
        {/* ------------------------------------------------------------- */}
        <div className="relative" ref={calendarRef}>
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 mb-1">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-neutral-500 fill-none stroke-current stroke-2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Select date
          </label>

          {/* Compact date selector button: py-2.5 px-3.5 */}
          <button
            type="button"
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-neutral-800 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer text-left"
          >
            <span>{formattedDateString}</span>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-neutral-500 fill-none stroke-current stroke-2 shrink-0"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>

          {/* Custom Elegant Calendar Popover */}
          {calendarOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl p-3.5 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-xs font-bold text-neutral-900">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={isAtCurrentMonth}
                    aria-label="Previous month"
                    className="h-6 w-6 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="h-6 w-6 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Weekday Letters */}
              <div className="grid grid-cols-7 text-center text-[10.5px] font-semibold text-neutral-400 mb-1">
                {WEEKDAY_NAMES.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {daysInMonth.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="h-6.5 w-6.5" />;
                  }

                  const isSelected =
                    selectedDate.getFullYear() === viewYear &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getDate() === day;

                  const cellDate = new Date(viewYear, viewMonth, day);
                  const isPast = cellDate < today;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => !isPast && handleSelectCalendarDay(day)}
                      disabled={isPast}
                      className={`h-6.5 w-6.5 mx-auto rounded-full flex items-center justify-center font-medium transition-colors text-xs ${isPast
                        ? "text-neutral-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-[#2b0934] text-white font-bold cursor-pointer"
                        : "text-neutral-700 hover:bg-[#f7ecfb] hover:text-[#2b0934] cursor-pointer"
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. Select Time Slot (Clean 3-column grid, compact py-1.5 px-3)*/}
        {/* ------------------------------------------------------------- */}
        <div>
          <label className="block text-xs font-bold text-neutral-800 mb-1.5">
            Select time slot
          </label>

          {/* 3-column grid with compact padding */}
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`py-1.5 px-3 text-center text-xs font-semibold rounded-xl transition-all cursor-pointer ${isSelected
                    ? "bg-[#2b0934] text-white shadow-xs"
                    : "bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200/90 hover:border-[#a813c9]/40"
                    }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. Ticket Tiers (Tightened vertical spacing py-0.5)            */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-2 pt-0.5">
          {tiers.map((tier) => {
            const qty = quantities[tier.id] ?? 0;
            return (
              <div
                key={tier.id}
                className="flex items-center justify-between py-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 shrink-0">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-800 text-xs sm:text-[13px] leading-snug">
                      {tier.name}
                    </p>
                    <p className="text-neutral-500 font-medium text-[11px] mt-0.5">
                      {tier.isFree ? "Free" : `€${tier.price.toFixed(2)}`}
                    </p>
                    <input
                      type="hidden"
                      name={`option:${tier.id}`}
                      value={qty}
                    />
                  </div>
                </div>

                {/* Compact Stepper buttons: h-6.5 w-6.5 text-xs */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQty(tier.id, -1)}
                    disabled={qty === 0}
                    aria-label={`Decrease ${tier.name}`}
                    className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-neutral-300/80 bg-white text-neutral-500 hover:text-neutral-800 hover:border-neutral-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs"
                  >
                    −
                  </button>
                  <span
                    className="w-4 text-center font-bold text-neutral-800 text-xs sm:text-sm"
                    aria-live="polite"
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(tier.id, 1)}
                    aria-label={`Increase ${tier.name}`}
                    className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-neutral-300/80 bg-white text-neutral-500 hover:text-neutral-800 hover:border-neutral-400 transition-colors cursor-pointer text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. Total Price Row (Tightened pt-2.5)                          */}
        {/* ------------------------------------------------------------- */}
        <div className="flex items-center justify-between border-t border-neutral-200/80 pt-2.5">
          <span className="text-xs sm:text-sm font-semibold text-neutral-800">Total</span>
          <span className="font-serif text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
            €{totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Server State Messages */}
        {state.status === "error" && (
          <p className="text-xs font-medium text-red-600 animate-in fade-in">
            {state.message || "Please select at least 1 ticket."}
          </p>
        )}
        {state.status === "success" && (
          <div className="rounded-xl bg-[#f7ecfb] border border-[#d2c8d6] px-3 py-1.5 text-xs font-semibold text-[#2b0934] flex items-center justify-between">
            <span>✓ Added to cart!</span>
            <a href="/cart" className="underline hover:text-[#a813c9]">
              View cart &rarr;
            </a>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. Add to Cart CTA Button (Tightened py-2.5 sm:py-3)           */}
        {/* ------------------------------------------------------------- */}
        <button
          type="submit"
          disabled={isPending || totalTickets === 0}
          className="w-full rounded-full bg-[#2b0934] hover:bg-[#3d0d4a] disabled:opacity-50 text-white py-2.5 sm:py-3 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <span>Adding to cart...</span>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2 shrink-0">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Add to Cart</span>
              <span className="text-sm sm:text-base leading-none">&rarr;</span>
            </>
          )}
        </button>

        {/* Subtext Guarantee */}
        <p className="flex items-center justify-center gap-1.5 text-center text-[10.5px] font-normal text-neutral-500 pt-0.5">
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-2 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Free cancellation up to 24 hours before
        </p>
      </form>
    </div>
  );
}
