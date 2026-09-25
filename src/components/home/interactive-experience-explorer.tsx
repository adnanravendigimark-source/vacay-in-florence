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
  "free-cancellation": "bg-neutral-900/90 text-white backdrop-blur-md",
  "skip-the-line": "bg-[#2b0934] text-white shadow-md font-semibold",
  "best-seller": "bg-[#b94726] text-white font-semibold shadow-md",
  "small-group": "bg-neutral-800/90 text-white backdrop-blur-md",
  "instant-confirmation": "bg-[#2b0934] text-white font-semibold",
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

interface InteractiveExperienceExplorerProps {
  experiences: ProductCardSummary[];
  content?: {
    experiencesBadge?: string;
    experiencesTitle?: string;
    experiencesSubtitle?: string;
  };
}

export function InteractiveExperienceExplorer({
  experiences,
  content,
}: InteractiveExperienceExplorerProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredExperiences = experiences.filter((exp) => {
    if (activeTab === "all") return true;
    return exp.categorySlug === activeTab;
  });

  const badge = content?.experiencesBadge || "CURATED EXPERIENCES";
  const title = content?.experiencesTitle || "Handcrafted Tours & Skip-The-Line Admissions";
  const subtitle =
    content?.experiencesSubtitle ||
    "Handcrafted tours and skip-the-line admissions chosen by local Florentines.";

  return (
    <section className="bg-white py-16 sm:py-24 border-b border-neutral-200/80">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2b0934]/10 px-3 py-1 text-xs font-semibold text-[#2b0934] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2b0934] animate-ping" />
              <span>{badge}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
              {title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 self-start lg:self-end rounded-full bg-[#2b0934] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#3d0d4a] hover:shadow-lg hover:scale-[1.02]"
          >
            <span>Explore All {experiences.length}+ Experiences</span>
            <span className="text-base">&rarr;</span>
          </Link>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.filter;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.filter)}
                className={`shrink-0 rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${isSelected
                    ? "bg-neutral-900 text-white shadow-md ring-2 ring-neutral-900 ring-offset-2 scale-100"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {filteredExperiences.map((exp, index) => {
            const primaryBadge = exp.badges[0];

            return (
              <div
                key={exp.id}
                className="group flex flex-col rounded-3xl bg-white border border-neutral-200/90 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-neutral-300 hover:-translate-y-1.5"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={exp.image.src}
                    alt={exp.image.alt}
                    fill
                    priority={index < 3}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badge (single tag only) */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center pointer-events-none">
                    {primaryBadge && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold shadow-sm ${BADGE_COLOR[primaryBadge]}`}
                      >
                        {BADGE_LABEL[primaryBadge]}
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-medium pointer-events-none">
                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {exp.durationLabel}
                    </span>
                    <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90">
                      {exp.categoryName}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  {/* Reviews & Provider */}
                  <div className="flex items-center justify-between text-xs">
                    {exp.ratingAverage ? (
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                        <span className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-800 ring-1 ring-amber-200/80">
                          <span className="text-amber-500">★</span>
                          <span>{exp.ratingAverage.toFixed(1)}</span>
                        </span>
                        <span className="text-neutral-500 font-normal text-[11px] whitespace-nowrap">
                          ({exp.reviewCount.toLocaleString()} reviews)
                        </span>
                      </div>
                    ) : null}
                    <span className="text-[11px] font-medium text-neutral-400 truncate max-w-[90px]">
                      by {exp.supplierName}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={`/experiences/${exp.slug}`}>
                    <h3 className="mt-3 text-sm sm:text-base font-bold leading-snug text-neutral-900 group-hover:text-[#2b0934] transition-colors line-clamp-2">
                      {exp.title}
                    </h3>
                  </Link>

                  {/* Short Description */}
                  <p className="mt-2 text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {exp.shortDescription}
                  </p>

                  {/* Key Highlights Checklist */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-col gap-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                      <span className="text-[#2b0934] font-bold">✓</span>
                      <span>Instant confirmation & mobile barcode entry</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#2b0934] font-bold">✓</span>
                      <span>Free cancellation up to 24 hours in advance</span>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider block">
                        From
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-black text-neutral-900">
                          {priceFormatter.format(exp.priceFrom.amount)}
                        </span>
                        <span className="text-xs text-neutral-500 font-normal">/ person</span>
                      </div>
                    </div>

                    <Link
                      href={`/experiences/${exp.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#2b0934] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#3d0d4a] hover:shadow-md hover:scale-105 active:scale-95"
                    >
                      <span>Book Ticket</span>
                      <span className="text-xs">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExperiences.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500 text-sm">No experiences found for this category.</p>
          </div>
        )}
      </Container>
    </section>
  );
}
