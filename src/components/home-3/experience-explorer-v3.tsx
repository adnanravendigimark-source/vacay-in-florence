"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { ProductCardSummary, ProductBadge } from "@/lib/types";

const BADGE_LABEL: Record<ProductBadge, string> = {
  "free-cancellation": "Free Cancellation",
  "skip-the-line": "⚡ Skip the Line",
  "best-seller": "🔥 Bestseller",
  "small-group": "👥 Small Group",
  "instant-confirmation": "✓ Instant Voucher",
};

const BADGE_COLOR: Record<ProductBadge, string> = {
  "free-cancellation": "bg-white/90 text-neutral-800 border border-neutral-200",
  "skip-the-line": "bg-[#c85a32] text-white font-semibold",
  "best-seller": "bg-[#9a3412] text-white font-semibold",
  "small-group": "bg-neutral-900/90 text-white backdrop-blur-md",
  "instant-confirmation": "bg-[#18181b] text-white font-semibold",
};

const priceFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const TABS = [
  { id: "all", label: "✨ All Highlights", filter: "all" },
  { id: "skip-the-line", label: "⚡ Skip-The-Line Tickets", filter: "skip-the-line-attractions" },
  { id: "museums", label: "🏛️ Museums & Galleries", filter: "museums-galleries" },
  { id: "food-wine", label: "🍷 Food & Tuscan Wine", filter: "food-wine-experiences" },
  { id: "guided", label: "🚶 Guided Walking Tours", filter: "guided-tours" },
  { id: "day-trips", label: "🌄 Day Trips from Florence", filter: "day-trips-from-florence" },
];

export function ExperienceExplorerV3({
  experiences,
}: {
  experiences: ProductCardSummary[];
}) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredExperiences = experiences.filter((exp) => {
    if (activeTab === "all") return true;
    return exp.categorySlug === activeTab;
  });

  return (
    <section className="bg-white py-16 sm:py-24 border-b border-[#eae5d9]/80">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fbf0eb] px-3.5 py-1 text-xs font-semibold text-[#c85a32] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c85a32] animate-pulse" />
              <span>DIRECT TICKET RESERVATIONS &amp; TOURS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Top-Rated Florence Experiences
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Official entrance tickets, expert local guides, and authentic Tuscan adventures — all with 100% free 24-hour cancellation.
            </p>
          </div>

          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 self-start lg:self-end rounded-full bg-[#18181b] px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#27272a] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore All {experiences.length}+ Experiences</span>
            <span className="text-base">&rarr;</span>
          </Link>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.filter;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.filter)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#18181b] text-white shadow-md"
                    : "bg-[#f3efe6] text-neutral-700 hover:bg-[#eae5d9] hover:text-neutral-950"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExperiences.map((exp) => (
            <article
              key={exp.id}
              className="group relative flex flex-col justify-between rounded-3xl bg-[#faf9f6] border border-[#e5e0d8] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={exp.image.src}
                  alt={exp.image.alt || exp.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Badges Container */}
                <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 items-start justify-between pointer-events-none">
                  {exp.badges && exp.badges.length > 0 ? (
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm ${
                        BADGE_COLOR[exp.badges[0]] || "bg-white/90 text-neutral-800"
                      }`}
                    >
                      {BADGE_LABEL[exp.badges[0]] || exp.badges[0]}
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-800 shadow-sm">
                      Official Access
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10.5px] font-bold text-white shadow-sm">
                    <span className="text-amber-400">★</span>
                    {exp.ratingAverage ? exp.ratingAverage.toFixed(1) : "4.9"}
                  </span>
                </div>

                {/* Duration Badge */}
                {exp.durationLabel && (
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-medium text-white shadow-sm">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {exp.durationLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">
                    <span>{exp.categoryName}</span>
                    <span>{exp.reviewCount} reviews</span>
                  </div>

                  <h3 className="font-display text-base font-semibold text-neutral-900 leading-snug group-hover:text-[#c85a32] transition-colors line-clamp-2">
                    <Link href={`/experiences/${exp.slug}`}>
                      <span className="absolute inset-0" />
                      {exp.title}
                    </Link>
                  </h3>

                  <p className="mt-2 text-xs text-neutral-600 line-clamp-2 font-normal leading-relaxed">
                    {exp.shortDescription}
                  </p>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-4 pt-3.5 border-t border-[#e5e0d8] flex items-end justify-between">
                  <div>
                    <span className="text-[10.5px] text-neutral-500 uppercase tracking-wider block font-semibold">
                      From
                    </span>
                    <span className="text-lg font-bold text-[#18181b]">
                      {priceFormatter.format(exp.priceFrom.amount)}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#c85a32] group-hover:translate-x-1 transition-transform">
                    <span>Book Now</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
