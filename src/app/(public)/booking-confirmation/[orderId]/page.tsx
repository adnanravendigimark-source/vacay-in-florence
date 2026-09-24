import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { inArray, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { productImages } from "@/lib/db/schema";
import { requireUser } from "@/lib/require-user";
import { getOrderForUser } from "@/lib/data/orders";
import { CopyReferenceButton } from "@/components/checkout/copy-reference-button";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

type Params = { orderId: string };

export default async function BookingConfirmationPage({ params }: { params: Promise<Params> }) {
  const { orderId } = await params;
  const user = await requireUser(`/booking-confirmation/${orderId}`);
  const order = await getOrderForUser(orderId, user.id);
  if (!order) notFound();

  // Fetch product images for each item in the order
  const productIds = Array.from(new Set(order.items.map((i) => i.productId)));
  const images = productIds.length > 0
    ? await db
        .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(asc(productImages.sortOrder))
    : [];

  const imageByProduct = new Map<string, { url: string; alt: string }>();
  for (const img of images) {
    if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img);
  }

  // Generate formatted booking reference (e.g., VIF-20260925-7642)
  const createdDateStr = new Date(order.createdAt).toISOString().slice(0, 10).replace(/-/g, "");
  const shortId = order.id.slice(0, 4).toUpperCase();
  const bookingReference = `VIF-${createdDateStr}-${shortId}`;

  const firstItem = order.items[0];
  const firstImage = firstItem
    ? imageByProduct.get(firstItem.productId)?.url ?? "/images/florence-hero.jpg"
    : "/images/florence-hero.jpg";

  return (
    <div className="w-full bg-[#FCFBF9] min-h-[90vh] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stepper Header (All checked up to Confirmation) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 text-xs sm:text-sm font-semibold select-none">
          {/* Step 1: Your Details (Completed) */}
          <div className="flex items-center gap-2 text-neutral-800 font-bold">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs bg-[#2B0934] text-white">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span>Your Details</span>
          </div>

          {/* Stepper Divider Line */}
          <div className="w-8 sm:w-12 h-[1px] bg-stone-300" />

          {/* Step 2: Payment (Completed) */}
          <div className="flex items-center gap-2 text-neutral-800 font-bold">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs bg-[#2B0934] text-white">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span>Payment</span>
          </div>

          {/* Stepper Divider Line */}
          <div className="w-8 sm:w-12 h-[1px] bg-stone-300" />

          {/* Step 3: Confirmation (Active) */}
          <div className="flex items-center gap-2 text-neutral-900 font-bold">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs bg-[#2B0934] text-white shadow-sm">
              3
            </div>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Confirmation Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#2B0934] text-white shadow-md mb-3">
            <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7 fill-none stroke-current stroke-[2.5]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-neutral-900">
            Booking Confirmed!
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-500">
            Your booking has been successfully completed.
          </p>
        </div>

        {/* Main Booking Summary Card */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs mb-6">
          {order.items.map((item, idx) => {
            const itemImage = imageByProduct.get(item.productId)?.url ?? firstImage;
            const itemParticipants = item.participants.reduce((s, p) => s + p.quantity, 0);

            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  idx > 0 ? "pt-5 mt-5 border-t border-stone-100" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-20 sm:h-20 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <Image
                      src={itemImage}
                      alt={item.productTitle}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                      {item.productTitle}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#a813c9] fill-none stroke-current stroke-2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                        <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{dateFormatter.format(new Date(item.date + "T00:00:00"))}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-neutral-400 fill-none stroke-current stroke-2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M5.5 20.5C6.5 16.8 9 15 12 15C15 15 17.5 16.8 18.5 20.5" />
                      </svg>
                      <span>
                        {itemParticipants} participant{itemParticipants === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-xl sm:text-2xl font-bold text-neutral-900">
                    {priceFormatter.format(item.subtotalAmount)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Booking Reference Bar */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-[#FAF8F5] border border-stone-200/80 px-4 py-2 text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <span>Booking Reference</span>
                <CopyReferenceButton reference={bookingReference} />
              </span>
            </div>

            <div className="font-mono text-sm sm:text-base font-bold tracking-wider text-neutral-900">
              {bookingReference}
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Confirmation Email */}
          <div className="flex flex-col items-center text-center rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
            <div className="mb-3 text-[#a813c9]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Confirmation Email</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed">
              We&apos;ve sent your booking details to your email.
            </p>
          </div>

          {/* Card 2: Manage Booking */}
          <div className="flex flex-col items-center text-center rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
            <div className="mb-3 text-[#a813c9]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Manage Booking</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed">
              View or modify your booking anytime.
            </p>
          </div>

          {/* Card 3: 24/7 Support */}
          <div className="flex flex-col items-center text-center rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
            <div className="mb-3 text-[#a813c9]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">24/7 Support</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed">
              Need help? Our team is here for you.
            </p>
          </div>

          {/* Card 4: Free Cancellation */}
          <div className="flex flex-col items-center text-center rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
            <div className="mb-3 text-[#a813c9]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Free Cancellation</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed">
              Up to 24 hours before your experience.
            </p>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/account/bookings"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#2B0934] hover:bg-[#3D0D4A] text-white font-bold text-sm px-8 py-3.5 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View My Booking</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-stone-300 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-sm px-8 py-3.5 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
