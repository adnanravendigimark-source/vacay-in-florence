"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import type { AttractionSummary } from "@/lib/types";
import { FlorenceCtaBanner } from "@/components/experiences/florence-cta-banner";

interface BrowseExperiencesViewProps {
  attractions: AttractionSummary[];
}

export function BrowseExperiencesView({
  attractions,
}: BrowseExperiencesViewProps) {
  return (
    <div className="w-full bg-white text-neutral-900">
      {/* ================================================================= */}
      {/* 1. TOP ATTRACTIONS IN FLORENCE (4-Column Grid) -- sourced from   */}
      {/* the real `attractions` prop (getAllAttractions()), not a        */}
      {/* hardcoded list. Each card links to that attraction's own real   */}
      {/* /experiences/attraction/[slug] page.                            */}
      {/* ================================================================= */}
      <section className="w-full bg-white pt-14 sm:pt-20 pb-10 sm:pb-14">
        <Container>
          {/* Header Row */}
          <div className="pb-6 border-b border-[#ece6dc] mb-8 sm:mb-10">
            <p className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] text-[#6b766d] uppercase mb-1.5">
              POPULAR ATTRACTIONS
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-normal text-neutral-900 tracking-tight leading-tight">
              Top Attractions in Florence
            </h2>
          </div>

          {/* 4-Column Attractions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {attractions.map((attraction) => (
              <div
                key={attraction.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-[#ece6dc] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] hover:-translate-y-1 hover:border-[#9e0ca0]/40 transition-all duration-300"
              >
                {/* Full Card Clickable Link */}
                <Link
                  href={`/experiences/attraction/${attraction.slug}`}
                  className="absolute inset-0 z-0"
                  aria-label={attraction.name}
                >
                  <span className="sr-only">View {attraction.name}</span>
                </Link>

                {/* Card Top: Image with Top-Left Badge */}
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                    <Image
                      src={attraction.image.src}
                      alt={attraction.image.alt}
                      fill
                      sizes="(min-width: 1280px) 280px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Top-Left Category Badge */}
                    {attraction.badgeText ? (
                      <div className="absolute left-3 top-3 z-10 pointer-events-none">
                        <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm backdrop-blur-md border border-neutral-200/80">
                          {attraction.badgeText}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Card Content Details */}
                  <div className="p-4 sm:p-4.5">
                    {/* Title */}
                    <h3 className="font-display text-base sm:text-[17px] font-semibold text-neutral-900 leading-snug group-hover:text-[#9e0ca0] transition-colors">
                      {attraction.name}
                    </h3>

                    {/* Location with Pin Icon */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#68736b]">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2] shrink-0 text-neutral-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.35-7-10a7 7 0 1 1 14 0c0 5.65-7 10-7 10z" />
                        <circle cx="12" cy="11" r="2.5" />
                      </svg>
                      <span className="truncate">Florence, Italy</span>
                    </div>

                    {/* Meta Row: real ticket/tour count for this attraction */}
                    <div className="mt-2.5 flex items-center gap-3 text-xs text-[#59655d]">
                      <div className="flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.85] text-neutral-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {attraction.productCount} {attraction.productCount === 1 ? "Ticket & Tour" : "Tickets & Tours"}
                        </span>
                      </div>
                    </div>

                    {/* Description Snippet */}
                    <p className="mt-2.5 text-xs text-[#59655d] leading-relaxed line-clamp-2">
                      {attraction.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Card Footer: View Details CTA */}
                <div className="p-4 sm:p-4.5 pt-0">
                  <div className="pt-3 border-t border-[#ece6dc] flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 group-hover:text-[#9e0ca0] transition-colors flex items-center gap-1">
                      <span>View Details</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================= */}
      {/* 2. BOTTOM CONCIERGE / CTA BANNER                                  */}
      {/* ================================================================= */}
      <div className="pb-16 sm:pb-20">
        <FlorenceCtaBanner />
      </div>
    </div>
  );
}
