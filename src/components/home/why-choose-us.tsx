import { Container } from "@/components/ui/container";
import Link from "next/link";

const COMPARISON_ROWS = [
  {
    feature: "Queue Time at Iconic Landmarks",
    gate: "Up to 2 to 3 hours under hot sun",
    vacay: "0 minutes — scan barcode directly at entry gate",
    highlight: true,
  },
  {
    feature: "Slot Availability",
    gate: "Often sold out 1–2 weeks in advance on site",
    vacay: "Guaranteed reserved entry timeslots",
    highlight: false,
  },
  {
    feature: "Cancellation & Refund Policy",
    gate: "100% Non-refundable paper tickets",
    vacay: "100% Free cancellation up to 24 hours prior",
    highlight: true,
  },
  {
    feature: "Ticket Format & Delivery",
    gate: "Paper tickets vulnerable to loss or damage",
    vacay: "Instant mobile voucher sent to Email & Apple Wallet",
    highlight: false,
  },
  {
    feature: "Customer Support & City Assistance",
    gate: "Limited counter staff with long queues",
    vacay: "24/7 dedicated traveler support team",
    highlight: false,
  },
];

const STATS = [
  { value: "98,000+", label: "Happy Travelers Welcomed" },
  { value: "4.9 / 5.0", label: "Average Experience Rating" },
  { value: "100%", label: "Verified Authentic Tickets" },
  { value: "24h", label: "Free Cancellation Guarantee" },
];

export function WhyChooseUs() {
  return (
    <section className="bg-[#0e241a] text-white py-18 sm:py-24 overflow-hidden relative">
      {/* Subtle Background Ambience Glow */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#faeedd]/10 blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-3 backdrop-blur-md">
            <span>THE VACAY FLORENCE DIFFERENCE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.15]">
            Why Travelers Choose VACAY Over the Ticket Box Office
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
            Skip the stress, bypass the lines, and enjoy guaranteed entry to Florence&apos;s world-renowned museums and sights.
          </p>
        </div>

        {/* Comparison Table / Grid Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl p-4 sm:p-8 shadow-2xl">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 pb-4 border-b border-white/10 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <div className="col-span-5 text-white/70">What to Expect</div>
            <div className="col-span-3 text-rose-300/80 flex items-center gap-1.5">
              <span>✕ Standard Gate</span>
            </div>
            <div className="col-span-4 text-emerald-400 flex items-center gap-1.5">
              <span>✓ VACAY Florence</span>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-white/10">
            {COMPARISON_ROWS.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 gap-3 py-4 text-xs sm:text-sm items-center ${
                  row.highlight ? "bg-white/[0.03] rounded-xl px-2 -mx-2" : ""
                }`}
              >
                <div className="col-span-5 font-medium text-white/90">{row.feature}</div>
                <div className="col-span-3 text-white/50 text-xs sm:text-[13px]">{row.gate}</div>
                <div className="col-span-4 font-semibold text-emerald-300 text-xs sm:text-[13px] flex items-center gap-1.5">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span>{row.vacay}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Call to Action inside comparison card */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-white/70">
              ⚡ Over 14,000+ verified tickets issued this season with zero hassle.
            </div>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-[#0e241a] hover:bg-neutral-100 transition-all active:scale-95 shadow-lg"
            >
              <span>Browse All Fast-Pass Tickets</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14 max-w-4xl mx-auto text-center">
          {STATS.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="text-2xl sm:text-3xl font-black font-display text-[#faeedd]">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-white/75">{stat.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
