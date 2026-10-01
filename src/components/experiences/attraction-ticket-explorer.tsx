"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProductCardSummary } from "@/lib/types";
import { ProductBadgePill } from "@/components/ui/badge";

type SortOption = "recommended" | "price-asc" | "price-desc" | "rating";

function formatBadgeLabel(badge: string): string {
  switch (badge) {
    case "skip-the-line":
      return "Skip-the-Line";
    case "guided-tour":
      return "Guided Tours";
    case "private-tour":
      return "Private Tours";
    case "small-group":
      return "Small Group";
    case "combo":
      return "Combo Tickets";
    case "free-cancellation":
      return "Free Cancellation";
    case "instant-confirmation":
      return "Instant Confirmation";
    case "best-seller":
      return "Best Seller";
    default:
      return badge.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export function AttractionTicketExplorer({
  products,
  attractionName,
  highlights,
  activeFilterQuery,
  onClearQuery,
}: {
  products: ProductCardSummary[];
  attractionName: string;
  highlights: string[];
  activeFilterQuery?: string;
  onClearQuery?: () => void;
}) {
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Derive unique badge categories
  const badgeCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      for (const b of p.badges) {
        if (["skip-the-line", "guided-tour", "combo", "best-seller", "small-group"].includes(b)) {
          counts.set(b, (counts.get(b) ?? 0) + 1);
        }
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // 1. Badge Filter
      if (selectedBadge !== "all") {
        if (selectedBadge === "dome-climb") {
          const match = p.title.toLowerCase().includes("dome") || p.title.toLowerCase().includes("climb");
          if (!match) return false;
        } else if (!p.badges.includes(selectedBadge as any)) {
          return false;
        }
      }

      // 2. Text Search Query from Assistant
      if (activeFilterQuery && activeFilterQuery.trim()) {
        const q = activeFilterQuery.toLowerCase().trim();
        const inTitle = p.title.toLowerCase().includes(q);
        const inDesc = (p.shortDescription || "").toLowerCase().includes(q);
        const inBadges = p.badges.some((b) => b.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inBadges) return false;
      }

      return true;
    });
  }, [products, selectedBadge, activeFilterQuery]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    switch (sort) {
      case "price-asc":
        return items.sort((a, b) => a.priceFrom.amount - b.priceFrom.amount);
      case "price-desc":
        return items.sort((a, b) => b.priceFrom.amount - a.priceFrom.amount);
      case "rating":
        return items.sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0));
      case "recommended":
      default:
        return items.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }, [filtered, sort]);

  return (
    <section id="tickets-section" className="w-full bg-white pt-10 sm:pt-14 pb-20 scroll-mt-20">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        {/* Active Assistant Filter Banner */}
        {activeFilterQuery && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-[#fdf2fe] border border-[#eedcee] px-4 py-3 text-sm text-neutral-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#9e0ca0] font-bold">✦ Assistant Filter:</span>
              <span className="font-semibold text-neutral-900">&ldquo;{activeFilterQuery}&rdquo;</span>
              <span className="text-xs text-neutral-500">({sorted.length} matches)</span>
            </div>
            {onClearQuery && (
              <button
                type="button"
                onClick={onClearQuery}
                className="text-xs font-bold text-[#9e0ca0] hover:underline cursor-pointer"
              >
                Clear Search ×
              </button>
            )}
          </div>
        )}

        {/* 1. Category Filter Pills Ribbon (matching CategoryFilterPills design) */}
        <div className="flex flex-wrap items-center gap-2.5 pb-6 border-b border-[#ece6dc]">
          <button
            type="button"
            onClick={() => setSelectedBadge("all")}
            className={`inline-flex items-center gap-2 shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              selectedBadge === "all"
                ? "bg-[#9e0ca0] text-white shadow-md ring-1 ring-black/10 scale-[1.02]"
                : "bg-white text-neutral-700 hover:bg-[#fdf2fe] hover:text-[#9e0ca0] border border-[#e4ded5] shadow-xs"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current opacity-85">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>All Tickets</span>
          </button>

          {/* Dome Climb shortcut if relevant */}
          {products.some((p) => p.title.toLowerCase().includes("dome") || p.title.toLowerCase().includes("climb")) && (
            <button
              type="button"
              onClick={() => setSelectedBadge(selectedBadge === "dome-climb" ? "all" : "dome-climb")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedBadge === "dome-climb"
                  ? "bg-[#9e0ca0] text-white shadow-md ring-1 ring-black/10 scale-[1.02]"
                  : "bg-white text-neutral-700 hover:bg-[#fdf2fe] hover:text-[#9e0ca0] border border-[#e4ded5] shadow-xs"
              }`}
            >
              <span>Brunelleschi&apos;s Dome</span>
            </button>
          )}

          {badgeCategories.map(([badge, count]) => {
            const isActive = selectedBadge === badge;
            return (
              <button
                key={badge}
                type="button"
                onClick={() => setSelectedBadge(isActive ? "all" : badge)}
                className={`inline-flex items-center gap-2 shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#9e0ca0] text-white shadow-md ring-1 ring-black/10 scale-[1.02]"
                    : "bg-white text-neutral-700 hover:bg-[#fdf2fe] hover:text-[#9e0ca0] border border-[#e4ded5] shadow-xs"
                }`}
              >
                <span>{formatBadgeLabel(badge)}</span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#fdf2fe] text-[#9e0ca0]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Section Heading Row */}
        <div className="mt-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#ece6dc]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#68736b]">
                {sorted.length} {sorted.length === 1 ? "Experience Available" : "Experiences Available"}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-normal text-neutral-900 leading-tight">
              Available Tickets &amp; Experiences
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5f6b61] max-w-xl leading-relaxed">
              Choose from skip-the-line passes, private tours, and all-inclusive combo tickets with guaranteed entry.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <span className="text-xs text-[#68736b] font-medium">Sort by:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none rounded-full border border-[#ded8cb] bg-white px-4 py-2 pr-8 text-xs font-semibold text-neutral-800 shadow-xs hover:border-[#9e0ca0] focus:border-[#9e0ca0] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 4-Column Ticket Cards Grid (Matching ExperienceCard) */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorted.map((product) => {
              const primaryBadge = product.badges?.[0] || "skip-the-line";
              const isWished = Boolean(wishlist[product.id]);

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-[#e8e3d8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Clickable Card Link covering whole card */}
                  <Link href={`/experiences/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.title}>
                    <span className="sr-only">View {product.title}</span>
                  </Link>

                  {/* Image Container with Editorial Aspect Ratio */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f4f2ec]">
                    <Image
                      src={product.image.src}
                      alt={product.image.alt || product.title}
                      fill
                      sizes="(min-width: 1280px) 280px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Soft Vignette Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Top-Left Category Badge */}
                    <div className="absolute left-3 top-3 z-10 pointer-events-none">
                      <ProductBadgePill badge={primaryBadge} />
                    </div>

                    {/* Top-Right Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(product.id, e)}
                      aria-label="Add to wishlist"
                      className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        isWished
                          ? "bg-rose-500 text-white shadow-md scale-110"
                          : "bg-black/35 hover:bg-black/55 text-white border border-white/35"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill={isWished ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Card Content Details */}
                  <div className="flex flex-1 flex-col p-4 sm:p-4.5 justify-between pointer-events-none">
                    <div>
                      {/* Category Tag */}
                      <div className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#738076]">
                        {product.categoryName}
                      </div>

                      {/* Title in font-display */}
                      <h3 className="font-display text-[16px] sm:text-[17px] font-semibold text-neutral-900 leading-snug line-clamp-2 mt-1 mb-2 group-hover:text-[#9e0ca0] transition-colors">
                        {product.title}
                      </h3>

                      {/* Star Rating & Review Count */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-2.5">
                        <span className="text-amber-500 text-sm">★</span>
                        <span className="font-bold text-neutral-900">
                          {product.ratingAverage ? product.ratingAverage.toFixed(1) : "4.8"}
                        </span>
                        <span className="text-neutral-400 text-[11px]">
                          ({(product.reviewCount || 120).toLocaleString()} reviews)
                        </span>
                      </div>

                      {/* Meta Details: Duration & Free Cancellation */}
                      <div className="flex items-center gap-3 text-xs text-[#6e5d75] pb-3">
                        <div className="flex items-center gap-1">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.85]">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{product.durationLabel}</span>
                        </div>
                        <span className="text-neutral-300">•</span>
                        <div className="flex items-center gap-1 text-[#9e0ca0] font-medium">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Free Cancel</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Price & Direct Arrow Button */}
                    <div className="mt-auto pt-3 border-t border-[#ede9e1] flex items-center justify-between">
                      <div className="flex items-baseline gap-1 text-xs text-neutral-500">
                        <span className="text-[11px]">From</span>
                        <span className="font-display text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-[#9e0ca0] transition-colors">
                          €{product.priceFrom.amount}
                        </span>
                        <span className="text-[11px] text-neutral-400">/ person</span>
                      </div>

                      <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[#fdf2fe] text-[#9e0ca0] group-hover:bg-[#9e0ca0] group-hover:text-white transition-all duration-200 shadow-xs">
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.2]">
                          <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e8e3d8] bg-white p-12 text-center shadow-xs">
            <p className="text-base font-semibold text-neutral-800">No experiences match your search</p>
            <p className="mt-1 text-xs text-neutral-500">Try selecting a different filter or reset search.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedBadge("all");
                if (onClearQuery) onClearQuery();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#9e0ca0] hover:bg-[#850b9e] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
