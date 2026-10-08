"use client";

import Image from "next/image";
import type { AttractionSummary, ProductCardSummary } from "@/lib/types";
import { AttractionTicketExplorer } from "@/components/experiences/attraction-ticket-explorer";
import { FlorenceCtaBanner } from "@/components/experiences/florence-cta-banner";
import { DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS } from "@/lib/attraction-defaults";

interface AttractionHubViewProps {
  attraction: AttractionSummary;
  tickets: ProductCardSummary[];
  weightedRating: number | null;
  totalReviews: number;
}

// Single consistent highlight icon -- `attraction.highlights` is a plain
// string[] with no per-item icon metadata, so every highlight chip uses
// this one icon rather than guessing a "matching" icon per word.
const highlightIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
    <path
      d="M12 2l2.4 7.2H22l-6 4.4 2.4 7.2-6.4-4.5-6.4 4.5 2.4-7.2-6-4.4h7.6z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function AttractionHubView({
  attraction,
  tickets,
  weightedRating,
  totalReviews,
}: AttractionHubViewProps) {
  const heroImage = attraction.heroImage ?? attraction.image;

  // Gallery collage sourced from this attraction's own real ticket photos
  // (never a hardcoded/guessed set of file paths matched off the slug) --
  // falls back to the attraction's own hero image if it has fewer than 3
  // tickets so the layout never breaks.
  const galleryImages = tickets.slice(0, 3).map((t) => ({ src: t.image.src, alt: t.title, caption: t.title }));
  while (galleryImages.length < 3) {
    galleryImages.push({ src: heroImage.src, alt: attraction.name, caption: attraction.name });
  }
  const [collageTallImg, collageTopImg, collageBottomImg] = galleryImages;

  // "About" highlight chips sourced from this attraction's real
  // `highlights` field (set in Admin), not a hardcoded Duomo-specific list.
  const aboutPoints = attraction.highlights.slice(0, 4).map((title) => ({ title, icon: highlightIcon }));

  // "Why Choose" value points — admin-editable per attraction (Page
  // Sections tab); falls back to the site's long-standing default 4
  // points when not customized.
  const whyChooseItems =
    attraction.whyChooseItems && attraction.whyChooseItems.length > 0
      ? attraction.whyChooseItems
      : DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS;

  return (
    <div className="w-full bg-white text-neutral-900">
      {/* SVG Clip Path Definition for the Curved Arc Mask (Exact match with Experiences Hero) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="attraction-curve-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.20 0 C 0.06 0.22, -0.01 0.50, 0.07 1 L 1 1 L 1 0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ================================================================= */}
      {/* 1. HERO SECTION (Curved Arc Mask + Clean White Brand Theme)        */}
      {/* ================================================================= */}
      <section className="relative w-full bg-white pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-14 lg:pb-16 border-b border-[#ece6dc]/80 overflow-hidden">
        {/* Right-Side Curved Panoramic Vista of Florence Landmark */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] xl:w-[61%] h-full z-0 pointer-events-none select-none">
          <div
            className="absolute inset-0 h-full w-full overflow-hidden"
            style={{
              clipPath: "url(#attraction-curve-clip)",
              WebkitClipPath: "url(#attraction-curve-clip)",
            }}
          >
            <Image
              src={heroImage.src || "/images/hero-florence-duomo.jpg"}
              alt={heroImage.alt || attraction.name}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover object-[center_36%]"
            />
            {/* Subtle atmospheric vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/15 via-transparent to-stone-900/5" />
          </div>

          {/* Soft Highlight Rim along the Curve */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full pointer-events-none z-10"
          >
            <path
              d="M 20 0 C 6 22, -1 50, 7 100"
              fill="none"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Mobile Background Fallback */}
        <div className="lg:hidden absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src={heroImage.src || "/images/hero-florence-duomo.jpg"}
            alt={heroImage.alt || attraction.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/60" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-[560px] pt-2 sm:pt-4">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-bold tracking-[0.22em] text-[#556358] uppercase mb-3 sm:mb-4">
              <span>{attraction.badgeText || "ICONIC ATTRACTIONS"}</span>
              <span className="text-[#9e0ca0] font-bold">•</span>
              <span>AUTHENTIC FLORENCE</span>
            </div>

            {/* Master Headline using font-display brand typography */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-[54px] lg:text-[58px] font-normal leading-[1.08] tracking-tight text-neutral-900">
              {attraction.name}
            </h1>

            {/* Subtitle -- the attraction's own first highlight, not a
                hardcoded Duomo-specific tagline */}
            {attraction.highlights[0] ? (
              <p className="font-display text-xl sm:text-2xl text-[#9e0ca0] italic font-normal mt-2">
                {attraction.highlights[0]}
              </p>
            ) : null}

            {/* Paragraph Description */}
            <p className="mt-4 sm:mt-5 text-[13.5px] sm:text-[14.5px] font-normal leading-relaxed text-[#59655d] max-w-md lg:max-w-lg">
              {attraction.shortDescription}
            </p>

            {/* 3 Feature Badges in a Row with Vertical Dividers */}
            <div className="mt-6 sm:mt-7 flex items-center gap-4 sm:gap-6 pt-1 text-xs text-[#2d3b33]">
              {/* Badge 1 */}
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-[#fdf2fe] flex items-center justify-center text-[#9e0ca0]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2 3 7h18l-9-5z" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <span className="block font-semibold text-[13px] text-neutral-900">Historic</span>
                  <span className="block text-[11px] text-neutral-500">Landmark</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-7 w-px bg-[#ece6dc]" />

              {/* Badge 2 */}
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-[#fdf2fe] flex items-center justify-center text-[#9e0ca0]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <span className="block font-semibold text-[13px] text-neutral-900">World-Famous</span>
                  <span className="block text-[11px] text-neutral-500">Attraction</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-7 w-px bg-[#ece6dc]" />

              {/* Badge 3 */}
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-[#fdf2fe] flex items-center justify-center text-[#9e0ca0]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.35-7-10a7 7 0 1 1 14 0c0 5.65-7 10-7 10z" />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <span className="block font-semibold text-[13px] text-neutral-900">Central</span>
                  <span className="block text-[11px] text-neutral-500">Location</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Quick Info Bar Card */}
          <div className="mt-8 sm:mt-10 rounded-2xl bg-white p-3.5 sm:p-4 px-6 sm:px-8 shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-[#ece6dc] max-w-[760px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ece6dc]">
              {/* Location -- true for every attraction on this Florence-only
                  site; never a fabricated per-attraction street address
                  (the schema has no address field). */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#fdf2fe] text-[#9e0ca0] border border-[#ede7ef] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.35-7-10a7 7 0 1 1 14 0c0 5.65-7 10-7 10z" />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Location
                  </span>
                  <span className="text-xs sm:text-[13px] font-bold text-neutral-900">
                    Florence, Italy
                  </span>
                </div>
              </div>

              {/* Tickets & Tours -- real count of this attraction's live
                  products, replacing a guessed "suggested visit time" */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-6">
                <div className="h-8 w-8 rounded-full bg-[#fdf2fe] text-[#9e0ca0] border border-[#ede7ef] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Tickets &amp; Tours
                  </span>
                  <span className="text-xs sm:text-[13px] font-bold text-neutral-900">
                    {tickets.length} {tickets.length === 1 ? "Experience" : "Experiences"}
                  </span>
                </div>
              </div>

              {/* Average Rating -- real weighted average from this
                  attraction's own tickets; an honest "no reviews yet"
                  state when there is none, never a fabricated fallback. */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-6">
                <div className="h-8 w-8 rounded-full bg-[#fdf2fe] text-[#9e0ca0] border border-[#ede7ef] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Average Rating
                  </span>
                  <span className="text-xs sm:text-[13px] font-bold text-neutral-900 flex items-center gap-1">
                    {weightedRating !== null ? (
                      <>
                        <span className="text-amber-500">★</span>
                        <span>{weightedRating.toFixed(1)}</span>
                        <span className="text-neutral-400 font-normal">
                          ({totalReviews.toLocaleString()} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-neutral-500 font-normal">New &mdash; no reviews yet</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. ABOUT THE LANDMARK + GALLERY (BALANCED 2-COLUMN SECTION)       */}
      {/* ================================================================= */}
      <section className="w-full bg-white py-14 sm:py-18 border-b border-[#ece6dc]/80">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Historical Context & Real Highlight Chips */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9e0ca0]" />
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#68736b]">
                    ABOUT THE {attraction.name.toUpperCase()}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-normal text-neutral-900 leading-[1.18] tracking-tight">
                  Discover {attraction.name}
                </h2>
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#59655d]">
                  {attraction.shortDescription}
                  {attraction.highlights.length > 0
                    ? ` Don't miss: ${attraction.highlights.join(", ")}.`
                    : ""}
                </p>
              </div>

              {/* Real highlight chips -- sourced from attraction.highlights,
                  never a fixed 4-item Duomo-specific list */}
              {aboutPoints.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {aboutPoints.map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#ece6dc] hover:border-[#9e0ca0]/40 text-center shadow-xs transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-[#fdf2fe] text-[#9e0ca0] flex items-center justify-center mb-2">
                        {item.icon}
                      </div>
                      <span className="text-[11.5px] font-semibold text-neutral-800 leading-tight">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Right Column: Visual Media Collage -- this attraction's own
                real ticket photos, never a slug-matched guess */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
              {/* Tall Left Facade Photo */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-neutral-100 group border border-[#ece6dc]">
                <Image
                  src={collageTallImg.src}
                  alt={collageTallImg.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-2 rounded-full bg-black/65 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-md">
                  <span className="text-xs">📍</span>
                  <span>{attraction.name}</span>
                </div>
              </div>

              {/* Stacked Right Photos */}
              <div className="flex flex-col gap-3.5">
                {/* Top */}
                <div className="relative flex-1 rounded-2xl overflow-hidden shadow-sm bg-neutral-100 group min-h-[140px] border border-[#ece6dc]">
                  <Image
                    src={collageTopImg.src}
                    alt={collageTopImg.alt}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/55 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white line-clamp-1 max-w-[90%]">
                    {collageTopImg.caption}
                  </span>
                </div>

                {/* Bottom */}
                <div className="relative flex-1 rounded-2xl overflow-hidden shadow-sm bg-neutral-100 group min-h-[140px] border border-[#ece6dc]">
                  <Image
                    src={collageBottomImg.src}
                    alt={collageBottomImg.alt}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/55 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white line-clamp-1 max-w-[90%]">
                    {collageBottomImg.caption}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. AVAILABLE TICKETS & EXPERIENCES (4-COLUMN CARD GRID)          */}
      {/* ================================================================= */}
      <AttractionTicketExplorer
        products={tickets}
        attractionName={attraction.name}
        highlights={attraction.highlights}
      />

      {/* ================================================================= */}
      {/* 4. WHY CHOOSE OUR EXPERIENCES BANNER                              */}
      {/* ================================================================= */}
      <section className="w-full bg-white pb-14 sm:pb-18">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#faf9f6] border border-[#ece6dc] p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left: Panoramic Photo */}
              <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-sm bg-neutral-200 border border-[#ece6dc]">
                <Image
                  src={heroImage.src}
                  alt={attraction.name}
                  fill
                  sizes="(min-width: 1024px) 35vw, 100vw"
                  className="object-cover object-center"
                />
              </div>

              {/* Right: 4 Value Points (generic marketing copy -- not
                  attraction-specific factual content) */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9e0ca0]" />
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#68736b]">
                    THE FLORENCE PROMISE
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-neutral-900 mb-6">
                  Why Choose Our {attraction.name} Experiences?
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {whyChooseItems.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#ece6dc] shadow-xs"
                    >
                      <div className="h-10 w-10 rounded-xl bg-[#fdf2fe] border border-[#9e0ca0]/20 flex items-center justify-center shrink-0 text-[#9e0ca0] font-bold shadow-xs">
                        {point.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">{point.title}</h4>
                        <p className="text-xs text-[#59655d] mt-0.5">{point.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtle watermark dome sketch on right */}
            <div className="absolute right-0 bottom-0 top-0 w-80 opacity-5 pointer-events-none select-none flex items-center justify-end pr-6">
              <svg viewBox="0 0 100 100" className="h-64 w-64 stroke-neutral-900 fill-none stroke-1">
                <path d="M50 10 C 25 30, 20 70, 20 90 L 80 90 C 80 70, 75 30, 50 10 Z" />
                <line x1="50" y1="10" x2="50" y2="90" />
                <circle cx="50" cy="10" r="3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. BOTTOM CONCIERGE / CTA BANNER (Standard Site Theme)            */}
      {/* ================================================================= */}
      <div className="pb-16 sm:pb-20">
        <FlorenceCtaBanner
          primaryLabel={attraction.ctaLabel || "Browse All Experiences"}
          primaryHref={attraction.ctaHref || "/experiences"}
        />
      </div>
    </div>
  );
}
