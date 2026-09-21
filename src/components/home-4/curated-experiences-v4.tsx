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

const priceFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const CATEGORY_TABS = [
  { id: "all", label: "✨ All Florence" },
  { id: "skip-the-line-attractions", label: "🏛️ Skip-The-Line Tickets" },
  { id: "museums-galleries", label: "🎨 Museums & Galleries" },
  { id: "food-wine-experiences", label: "🍷 Food & Tuscan Wine" },
  { id: "guided-tours", label: "🧭 Guided Walking Tours" },
  { id: "day-trips-from-florence", label: "🌄 Day Trips from Florence" },
];

export function CuratedExperiencesV4({
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
    <section className="bg-white py-16 sm:py-24 border-b border-[#eae5d9]/60">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#183528]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#183528]">
                CURATED EXPERIENCES
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Top Experiences in Florence
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 max-w-xl">
              Verified entrance tickets, small-group walking tours, and authentic Tuscan adventures with instant confirmation.
            </p>
          </div>

          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 self-start lg:self-end rounded-full bg-[#183528] px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#0e241a] transition-all"
          >
            <span>View All {experiences.length}+ Experiences</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#183528] text-white shadow-sm"
                    : "bg-[#f4f3ef] text-neutral-700 hover:bg-[#eae5d9]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Experiences Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredExperiences.map((exp) => (
            <article
              key={exp.id}
              className="group relative flex flex-col justify-between rounded-3xl bg-white border border-[#eae5d9] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={exp.image.src}
                  alt={exp.image.alt || exp.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge Top Left */}
                <div className="absolute top-3 left-3">
                  {exp.badges && exp.badges.length > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                      {BADGE_LABEL[exp.badges[0]] || exp.badges[0]}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                      Official Access
                    </span>
                  )}
                </div>

                {/* Rating Top Right */}
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10.5px] font-bold text-white shadow-sm">
                    <span className="text-amber-400">★</span>
                    {exp.ratingAverage ? exp.ratingAverage.toFixed(1) : "4.9"}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium uppercase tracking-wider mb-1.5">
                    <span>{exp.categoryName}</span>
                    <span>{exp.reviewCount} reviews</span>
                  </div>

                  <h3 className="font-display text-sm sm:text-base font-semibold text-neutral-900 leading-snug group-hover:text-[#183528] transition-colors line-clamp-2">
                    <Link href={`/experiences/${exp.slug}`}>
                      <span className="absolute inset-0" />
                      {exp.title}
                    </Link>
                  </h3>

                  <p className="mt-2 text-xs text-neutral-600 line-clamp-2 font-normal leading-relaxed">
                    {exp.shortDescription}
                  </p>
                </div>

                {/* Footer Price & Action */}
                <div className="mt-4 pt-3 border-t border-[#eae5d9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                      From
                    </span>
                    <span className="text-base font-bold text-neutral-900">
                      {priceFormatter.format(exp.priceFrom.amount)}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-[#f4f3ef] flex items-center justify-center text-xs font-bold text-neutral-700 group-hover:bg-[#183528] group-hover:text-white transition-colors">
                    &rarr;
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
