"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { CategorySummary, CategoryIcon } from "@/lib/types";

// Real per-category icons, keyed by the DB\'s CategoryIcon enum (see
// CategorySummary.icon) — reused from CategoryCardShowcase\'s icon set for
// visual consistency. Every category this renders comes from the
// \'categories\' prop (getAllCategories(), real DB rows): nothing here is a
// hardcoded category list, count, description or image, so an admin
// adding/renaming/removing a category is reflected immediately.
const ICONS: Record<CategoryIcon, React.ReactNode> = {
  landmark: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <path d="M12 3v18M8 21h8M5 17h14M7 13h10M9 9h6M11 5h2" />
      <path d="M6 21l6-18 6 18" />
    </svg>
  ),
  museum: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L3 10h18L12 3z" />
    </svg>
  ),
  "tour-guide": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  "food-wine": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5V3H7v7a5 5 0 0 0 5 5z" />
      <line x1="7" y1="8" x2="17" y2="8" />
    </svg>
  ),
  "day-trip": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  outdoor: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l4-9h4M10 17h8l-3-6-2.5 2" />
    </svg>
  ),
};


export function CategoryBrowseSection({
  categories = [],
}: {
  categories?: CategorySummary[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  // Filter and sort the real categories (never a hardcoded list)
  const filteredItems = useMemo(() => {
    let list = [...categories];
    if (activeCategory !== "all") {
      list = list.filter((item) => item.slug === activeCategory || item.id === activeCategory);
    }
    if (sortBy === "popular") {
      list.sort((a, b) => b.productCount - a.productCount);
    } else if (sortBy === "alphabetical") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [categories, activeCategory, sortBy]);

  return (
    <section className="w-full bg-white py-10 sm:py-14">
      <Container>
        {/* Top Category Circles Bar (Sub-navigation) */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-4 pt-1 no-scrollbar justify-start lg:justify-center border-b border-stone-100">
          {/* All Categories button */}
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className="group flex flex-col items-center gap-2 shrink-0 select-none cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-200 ${
                activeCategory === "all"
                  ? "bg-[#2B0934] text-white shadow-md ring-2 ring-[#2B0934]/20"
                  : "bg-[#F3EFE9] text-neutral-700 hover:bg-[#EAE4DC] hover:text-neutral-900"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <span
                className={`text-xs tracking-tight transition-colors ${
                  activeCategory === "all"
                    ? "font-bold text-neutral-900"
                    : "font-medium text-neutral-500 group-hover:text-neutral-900"
                }`}
              >
                All Categories
              </span>
              {activeCategory === "all" && (
                <span className="w-6 h-[2px] bg-[#2B0934] rounded-full mt-1" />
              )}
            </div>
          </button>

          {/* 8 Categories */}
          {categories.map((item) => {
            const isActive = activeCategory === item.slug;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.slug)}
                className="group flex flex-col items-center gap-2 shrink-0 select-none cursor-pointer transition-transform active:scale-95"
              >
                <div
                  className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#2B0934] text-white shadow-md ring-2 ring-[#2B0934]/20"
                      : "bg-[#F3EFE9] text-neutral-700 hover:bg-[#EAE4DC] hover:text-neutral-900"
                  }`}
                >
                  {ICONS[item.icon]}
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={`text-xs tracking-tight transition-colors ${
                      isActive
                        ? "font-bold text-neutral-900"
                        : "font-medium text-neutral-500 group-hover:text-neutral-900"
                    }`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="w-6 h-[2px] bg-[#2B0934] rounded-full mt-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Section Header */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
              ALL CATEGORIES
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">
              Browse by Category
            </h2>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-full border border-stone-200/90 bg-white py-1.5 pl-3.5 pr-8 text-xs font-semibold text-neutral-800 shadow-xs hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#a813c9] cursor-pointer"
              >
                <option value="popular">Popular</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#2B0934] text-white shadow-xs"
                : "border border-stone-200 bg-white text-neutral-600 hover:bg-stone-50"
            }`}
          >
            All
          </button>
          {categories.map((item) => {
            const isActive = activeCategory === item.slug;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.slug)}
                className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2B0934] text-white shadow-xs"
                    : "border border-stone-200 bg-white text-neutral-600 hover:bg-stone-50"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* 8 Category Cards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            return (
              <Link
                key={item.id}
                href={`/experiences/category/${item.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl h-[340px] sm:h-[360px] p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Background Image */}
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark Gradient Overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                {/* Top-Left Floating Icon Badge */}
                <div className="relative z-10 self-start flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                  {ICONS[item.icon]}
                </div>

                {/* Bottom Content & Arrow Button */}
                <div className="relative z-10 flex items-end justify-between gap-3">
                  <div className="min-w-0 flex-1 text-white">
                    <h3 className="font-display text-lg sm:text-xl font-bold leading-tight drop-shadow-sm">
                      {item.name}
                    </h3>
                    <div className="text-xs font-semibold text-white/90 mt-1">
                      {item.productCount} {item.productCount === 1 ? "Experience" : "Experiences"}
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/75 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.shortDescription}
                    </p>
                  </div>

                  {/* Circular White Arrow Button */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md transition-all duration-300 group-hover:bg-[#2B0934] group-hover:text-white group-hover:scale-110">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.2]">
                      <path d="M4 10h11m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Call-to-Action Banner ("Not sure where to start?") */}
        <div className="mt-16 relative overflow-hidden rounded-3xl border border-stone-200/90 bg-[#FAF8F5] p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Text & CTA */}
            <div className="lg:col-span-6 xl:col-span-6 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                {/* Olive sprig icon */}
                <svg className="w-8 h-8 text-[#556358] -rotate-12 stroke-current fill-none" viewBox="0 0 100 100">
                  <path d="M20,80 Q50,40 80,20" strokeWidth="3" />
                  <path d="M40,55 Q35,45 45,40" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
                  <path d="M60,35 Q65,25 55,20" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
                  <path d="M75,25 Q85,15 70,10" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
                </svg>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                  EXPLORE MORE
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
                Not sure where to start?
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md">
                Let us help you find the perfect experience in Florence based on your interests and travel style.
              </p>

              <div className="mt-6">
                <Link
                  href="/experiences"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2B0934] hover:bg-[#3D0D4A] text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3.5 shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <span>Get Inspired</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Right Overlapping Polaroids / Photos with handwritten flourish */}
            <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center min-h-[260px] sm:min-h-[290px]">
              {/* Olive branch background accent */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-24 h-24 text-[#556358]/40 pointer-events-none z-0">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full rotate-45">
                  <path d="M10,90 Q50,50 90,10" strokeWidth="2.5" />
                  <path d="M30,65 Q25,55 38,50" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
                  <path d="M55,45 Q62,35 50,30" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
                  <path d="M72,30 Q80,20 68,15" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
                </svg>
              </div>

              <div className="relative w-full max-w-[420px] flex items-center justify-center">
                {/* Polaroid 1 (Left - Duomo Dome) */}
                <div className="relative -rotate-6 z-10 transform transition-transform duration-300 hover:rotate-0 hover:scale-105 shadow-xl rounded-xl bg-white p-2.5 pb-6">
                  <div className="relative w-36 h-44 sm:w-44 sm:h-52 overflow-hidden rounded-lg bg-stone-100">
                    <Image
                      src="/images/hero-florence-duomo.jpg"
                      alt="Duomo in Florence"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Polaroid 2 (Right - Historic Florence Street) */}
                <div className="relative rotate-6 -ml-8 sm:-ml-12 z-20 transform transition-transform duration-300 hover:rotate-0 hover:scale-105 shadow-2xl rounded-xl bg-white p-2.5 pb-6">
                  <div className="relative w-36 h-44 sm:w-44 sm:h-52 overflow-hidden rounded-lg bg-stone-100">
                    <Image
                      src="/images/hero2-guided-tour.jpg"
                      alt="Historic street in Florence"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>

                  {/* Handwritten Sticky Note Flourish */}
                  <div className="absolute -bottom-4 -right-4 bg-white/95 border border-stone-200/90 rounded-lg px-3 py-2 shadow-lg -rotate-3 text-center">
                    <span className="block font-script text-sm sm:text-base text-neutral-800 leading-tight">
                      Your next
                      <br />
                      adventure awaits
                    </span>
                    <span className="block text-xs text-[#a813c9]">♡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
