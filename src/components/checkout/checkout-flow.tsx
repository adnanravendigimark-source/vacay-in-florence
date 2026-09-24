"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { placeOrderAction } from "@/app/(public)/checkout/actions";
import type { CartSummary } from "@/lib/data/cart";

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export function CheckoutFlow({
  cart,
  initialUser,
  serverError,
}: {
  cart: CartSummary;
  initialUser: { name?: string | null; email?: string | null };
  serverError?: string;
}) {
  const [step, setStep] = useState<"details" | "payment">("details");

  // Step 1: Details state
  const [customerName, setCustomerName] = useState(initialUser.name ?? "Adnan Khan");
  const [customerEmail, setCustomerEmail] = useState(initialUser.email ?? "adnanravendigi@gmail.com");
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [notes, setNotes] = useState("");
  const [detailsError, setDetailsError] = useState("");

  // Step 2: Payment state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple_pay">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardholderName, setCardholderName] = useState(initialUser.name ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setDetailsError("Please enter your full name.");
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setDetailsError("Please enter a valid email address.");
      return;
    }
    setDetailsError("");
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const firstItem = cart.items[0];

  return (
    <div className="w-full bg-[#FCFBF9] min-h-[90vh] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Progress Stepper Header */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-10 text-xs sm:text-sm font-semibold select-none">
          {/* Step 1: Your Details */}
          <div
            onClick={() => setStep("details")}
            className={`flex items-center gap-2 cursor-pointer transition-all ${
              step === "details"
                ? "text-neutral-900 font-bold"
                : "text-neutral-700 hover:text-neutral-950"
            }`}
          >
            <div
              className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs transition-all ${
                step === "details"
                  ? "bg-[#2B0934] text-white shadow-sm"
                  : "bg-[#2B0934] text-white"
              }`}
            >
              {step === "payment" ? (
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                "1"
              )}
            </div>
            <span>Your Details</span>
          </div>

          {/* Stepper Divider Line */}
          <div className="w-8 sm:w-12 h-[1px] bg-stone-300" />

          {/* Step 2: Payment */}
          <div
            className={`flex items-center gap-2 transition-all ${
              step === "payment"
                ? "text-neutral-900 font-bold"
                : "text-neutral-400"
            }`}
          >
            <div
              className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs transition-all ${
                step === "payment"
                  ? "bg-[#2B0934] text-white shadow-sm"
                  : "border border-stone-300 text-neutral-400 bg-white"
              }`}
            >
              2
            </div>
            <span>Payment</span>
          </div>

          {/* Stepper Divider Line */}
          <div className="w-8 sm:w-12 h-[1px] bg-stone-300" />

          {/* Step 3: Confirmation */}
          <div className="flex items-center gap-2 text-neutral-400">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs border border-stone-300 bg-white">
              3
            </div>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Main Grid: Form (Left) + Order Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Card */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
              {(serverError || detailsError) && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-medium">
                  {serverError || detailsError}
                </div>
              )}

              {step === "details" ? (
                /* STEP 1: YOUR DETAILS */
                <form onSubmit={handleDetailsSubmit} className="space-y-5">
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
                      Your Details
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                      Please enter your contact information and booking notes (optional).
                    </p>
                  </div>

                  {/* Row 1: Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="relative rounded-2xl border border-stone-200/90 bg-neutral-50/50 p-3 focus-within:border-[#a813c9] focus-within:ring-1 focus-within:ring-[#a813c9] focus-within:bg-white transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className="text-neutral-400 shrink-0">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M5.5 20.5C6.5 16.8 9 15 12 15C15 15 17.5 16.8 18.5 20.5" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Full name *
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none p-0 mt-0.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="relative rounded-2xl border border-stone-200/90 bg-neutral-50/50 p-3 focus-within:border-[#a813c9] focus-within:ring-1 focus-within:ring-[#a813c9] focus-within:bg-white transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className="text-neutral-400 shrink-0">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Email address *
                          </label>
                          <input
                            type="email"
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none p-0 mt-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Phone number */}
                  <div className="relative rounded-2xl border border-stone-200/90 bg-neutral-50/50 p-3 focus-within:border-[#a813c9] focus-within:ring-1 focus-within:ring-[#a813c9] focus-within:bg-white transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="text-neutral-400 shrink-0">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Phone number (optional)
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none p-0 mt-0.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Booking Notes */}
                  <div className="relative rounded-2xl border border-stone-200/90 bg-neutral-50/50 p-3.5 focus-within:border-[#a813c9] focus-within:ring-1 focus-within:ring-[#a813c9] focus-within:bg-white transition-all">
                    <div className="flex items-start gap-2.5">
                      <div className="text-neutral-400 shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label htmlFor="checkout-notes" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 cursor-pointer">
                          Notes for your booking (optional)
                        </label>
                        <textarea
                          id="checkout-notes"
                          rows={3}
                          maxLength={500}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special requests? Dietary needs? Let us know..."
                          className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none resize-none mt-1 p-0"
                        />
                        <div className="text-right text-[10px] text-neutral-400">
                          {notes.length}/500
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-[#2B0934] hover:bg-[#3D0D4A] text-white font-bold text-sm py-4 px-6 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Continue to Payment</span>
                      <span>&rarr;</span>
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#a813c9] fill-none stroke-current stroke-2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Your information is safe and secure.</span>
                    </div>
                  </div>
                </form>
              ) : (
                /* STEP 2: PAYMENT METHOD */
                <form
                  action={async (formData) => {
                    setIsSubmitting(true);
                    formData.set("customerName", customerName);
                    formData.set("customerEmail", customerEmail);
                    formData.set("customerPhone", customerPhone);
                    formData.set("notes", notes);
                    await placeOrderAction(formData);
                  }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
                        Payment Method
                      </h1>
                      <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                        Choose how you&apos;d like to pay for your booking.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="text-xs font-semibold text-[#a813c9] hover:text-[#850b9e] hover:underline cursor-pointer"
                    >
                      &larr; Back to Details
                    </button>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Credit Card Tab */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 px-3 text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-[#a813c9] bg-[#f7ecfb]/50 text-neutral-900 shadow-xs ring-1 ring-[#a813c9]/30"
                          : "border-stone-200 bg-neutral-50 text-neutral-600 hover:bg-stone-100"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2 text-[#a813c9]">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                      <span className="hidden sm:inline">Credit / Debit</span> Card
                    </button>

                    {/* PayPal Tab */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 px-3 text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        paymentMethod === "paypal"
                          ? "border-[#a813c9] bg-[#f7ecfb]/50 text-neutral-900 shadow-xs ring-1 ring-[#a813c9]/30"
                          : "border-stone-200 bg-neutral-50 text-neutral-600 hover:bg-stone-100"
                      }`}
                    >
                      <span className="font-bold text-[#003087]">Pay</span>
                      <span className="font-bold text-[#0079C1]">Pal</span>
                    </button>

                    {/* Apple Pay Tab */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("apple_pay")}
                      className={`flex items-center justify-center gap-1.5 rounded-2xl py-3.5 px-3 text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        paymentMethod === "apple_pay"
                          ? "border-[#a813c9] bg-[#f7ecfb]/50 text-neutral-900 shadow-xs ring-1 ring-[#a813c9]/30"
                          : "border-stone-200 bg-neutral-50 text-neutral-600 hover:bg-stone-100"
                      }`}
                    >
                      <span className="text-base leading-none"></span>
                      <span>Pay</span>
                    </button>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 pt-1">
                      {/* Card Number */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Card Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            className="w-full rounded-xl border border-stone-200/90 bg-neutral-50/40 px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9] focus:bg-white transition-all pr-12"
                          />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                              <rect width="20" height="14" x="2" y="5" rx="2" />
                              <line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Expiry Date & CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / YY"
                            className="w-full rounded-xl border border-stone-200/90 bg-neutral-50/40 px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9] focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            CVV *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="123"
                              className="w-full rounded-xl border border-stone-200/90 bg-neutral-50/40 px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9] focus:bg-white transition-all pr-10"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full rounded-xl border border-stone-200/90 bg-neutral-50/40 px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className="rounded-2xl border border-stone-200 bg-neutral-50 p-6 text-center text-xs sm:text-sm text-neutral-600">
                      You will be redirected to PayPal to complete your payment securely.
                    </div>
                  )}

                  {paymentMethod === "apple_pay" && (
                    <div className="rounded-2xl border border-stone-200 bg-neutral-50 p-6 text-center text-xs sm:text-sm text-neutral-600">
                      Click the button below to authorize payment using Apple Pay on your device.
                    </div>
                  )}

                  {/* Pay Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-[#2B0934] hover:bg-[#3D0D4A] text-white font-bold text-sm py-4 px-6 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>
                        {isSubmitting
                          ? "Processing Payment..."
                          : `Pay ${priceFormatter.format(cart.totalAmount)}`}
                      </span>
                      <span>&rarr;</span>
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#a813c9] fill-none stroke-current stroke-2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Your payment information is encrypted and secure.</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-neutral-900">
                  {step === "payment" ? "Booking Summary" : "Order Summary"}
                </h2>
                <Link
                  href="/cart"
                  className="text-xs font-semibold text-neutral-500 hover:text-[#a813c9] flex items-center gap-1 transition-colors"
                >
                  <span>✎</span>
                  <span>{step === "payment" ? "Edit" : "Edit Cart"}</span>
                </Link>
              </div>

              {/* Product Preview Row */}
              {firstItem && (
                <div className="mt-5 flex items-center gap-3.5 pb-4 border-b border-stone-100">
                  <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <Image
                      src={firstItem.image.src}
                      alt={firstItem.image.alt}
                      fill
                      sizes="70px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-1">
                      {firstItem.productTitle}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#a813c9] fill-none stroke-current stroke-2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                        <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{dateFormatter.format(new Date(firstItem.date + "T00:00:00"))}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Participant line */}
              <div className="mt-4 flex items-center justify-between text-sm text-neutral-700">
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-400 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5.5 20.5C6.5 16.8 9 15 12 15C15 15 17.5 16.8 18.5 20.5" />
                  </svg>
                  <span>
                    {cart.totalParticipants} participant{cart.totalParticipants === 1 ? "" : "s"}
                  </span>
                </div>
                <span className="font-semibold text-neutral-900">
                  {priceFormatter.format(cart.totalAmount)}
                </span>
              </div>

              {/* Total row */}
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-base">Total</span>
                <span className="font-display text-2xl font-bold text-neutral-900">
                  {priceFormatter.format(cart.totalAmount)}
                </span>
              </div>

              {/* Free Cancellation Reassurance Box */}
              <div className="mt-5 rounded-xl bg-[#FAF5FC] border border-[#a813c9]/15 p-3.5 flex items-center gap-2.5 text-xs text-neutral-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#a813c9] shrink-0 fill-none stroke-current stroke-2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Free cancellation up to 24 hours before your experience</span>
              </div>
            </div>

            {/* Step 1: Bottom 3-Column Trust Guarantees */}
            {step === "details" && (
              <div className="relative rounded-2xl border border-stone-200/80 bg-[#FAF8F5]/80 p-5">
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="flex flex-col items-center gap-1.5 border-r border-stone-200/80 pr-2">
                    <div className="text-[#a813c9]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-neutral-800 leading-tight">Secure Booking</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 border-r border-stone-200/80 px-1">
                    <div className="text-[#a813c9]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-neutral-800 leading-tight">24/7 Support</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 pl-2">
                    <div className="text-[#a813c9]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <span className="font-semibold text-neutral-800 leading-tight">Multiple Payment Options</span>
                  </div>
                </div>

                {/* Handwritten Script Flourish */}
                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-end gap-2 pr-1">
                  <svg className="w-8 h-8 text-[#a813c9]/40 -rotate-12 stroke-current fill-none" viewBox="0 0 100 100">
                    <path d="M20,80 Q50,40 80,20" strokeWidth="3" />
                    <path d="M40,55 Q35,45 45,40" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
                    <path d="M60,35 Q65,25 55,20" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
                    <path d="M75,25 Q85,15 70,10" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
                  </svg>
                  <span className="font-script text-lg text-neutral-600 -rotate-2">See you in Florence</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Bottom Full-Width 3-Card Trust Banner */}
        {step === "payment" && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Secure Payment */}
            <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-[#FAF8F5]/80 p-5">
              <div className="text-[#a813c9] shrink-0">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Secure Payment</h4>
                <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Your transaction is protected with industry-standard encryption.
                </p>
              </div>
            </div>

            {/* Card 2: 24/7 Support */}
            <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-[#FAF8F5]/80 p-5">
              <div className="text-[#a813c9] shrink-0">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900">24/7 Support</h4>
                <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Need help? Our team is here for you anytime.
                </p>
              </div>
            </div>

            {/* Card 3: Flexible Cancellation */}
            <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-[#FAF8F5]/80 p-5">
              <div className="text-[#a813c9] shrink-0">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Flexible Cancellation</h4>
                <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Free cancellation up to 24 hours before your experience.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
