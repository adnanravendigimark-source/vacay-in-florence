"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExperienceCard } from "@/components/ui/experience-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryFilterPills } from "@/components/experiences/category-filter-pills";
import { FlorenceCtaBanner } from "@/components/experiences/florence-cta-banner";
import { Container } from "@/components/ui/container";
import type { SearchProductsResult, ProductSortOption } from "@/lib/data/products";
import type { CategorySummary } from "@/lib/types";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const PAGE_SIZE = 10;

export function ExperienceListing({
  basePath,
  result,
  categories,
  activeCategorySlug,
  currentParams,
  showCategoryFilters = true,
  titleOverride,
  subtitleOverride,
}: {
  basePath: string;
  result: SearchProductsResult;
  categories: CategorySummary[];
  activeCategorySlug?: string;
  currentParams: Record<string, string | undefined>;
  showCategoryFilters?: boolean;
  titleOverride?: string;
  subtitleOverride?: string;
}) {
  const router = useRouter();

  // Local, accumulating copy of the catalog page(s) loaded so far. Reset
  // whenever the server hands us a fresh `result` (a full navigation —
  // sort change, category change, search) rather than an infinite-scroll
  // "load more" fetch, which only appends. Adjusting state during render
  // (rather than in a useEffect) is the React-recommended pattern for
  // "reset local state when a prop changes" — it re-renders immediately
  // with the reset values instead of committing a stale frame first.
  const [prevResult, setPrevResult] = useState(result);
  const [items, setItems] = useState(result.items);
  const [page, setPage] = useState(result.page);
  const [hasMore, setHasMore] = useState(result.page < result.totalPages);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { total } = result;

  if (result !== prevResult) {
    setPrevResult(result);
    setItems(result.items);
    setPage(result.page);
    setHasMore(result.page < result.totalPages);
    setLoadError(false);
  }

  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setLoadError(false);

    const nextPage = page + 1;
    const qs = new URLSearchParams();
    if (currentParams.q) qs.set("q", currentParams.q);
    if (currentParams.dest) qs.set("dest", currentParams.dest);
    if (currentParams.date) qs.set("date", currentParams.date);
    if (currentParams.sort) qs.set("sort", currentParams.sort);
    if (activeCategorySlug) qs.set("categorySlug", activeCategorySlug);
    qs.set("page", String(nextPage));
    qs.set("pageSize", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/experiences?${qs.toString()}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: SearchProductsResult = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setHasMore(data.page < data.totalPages);
    } catch (error) {
      console.error("[ExperienceListing] failed to load more experiences:", error);
      setLoadError(true);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [page, hasMore, currentParams, activeCategorySlug]);

  // Fires `loadMore` once the sentinel below the grid scrolls near the
  // viewport, so the next batch is ready before the user hits the bottom.
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v && k !== "sort" && k !== "page") params.set(k, v);
    });
    if (newSort !== "recommended") params.set("sort", newSort);
    router.push(`${basePath}?${params.toString()}`);
  };

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const sectionTitle =
    titleOverride ||
    (activeCategory ? `${activeCategory.name} in Florence` : "Curated Florence Experiences");
  const sectionSubtitle =
    subtitleOverride ||
    (activeCategory
      ? activeCategory.shortDescription
      : "Skip-the-line museum tickets, expert-guided landmark tours, and authentic Tuscan excursions with guaranteed entrance.");

  return (
    <div className="w-full bg-white pt-10 sm:pt-14 pb-16 sm:pb-20">
      <Container>
        {/* Category Filters Ribbon */}
        {showCategoryFilters && categories.length > 0 && (
          <div id="categories" className="mb-10 scroll-mt-28">
            <CategoryFilterPills categories={categories} activeCategorySlug={activeCategorySlug} />
          </div>
        )}

        {/* Section Title & Sort Controls */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#ece6dc]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#68736b]">
                {total} {total === 1 ? "Experience Available" : "Experiences Available"}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#2b0934] leading-tight">
              {sectionTitle}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5f6b61] max-w-xl leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <span className="text-xs text-[#68736b] font-medium">Sort by:</span>
            <div className="relative">
              <select
                value={currentParams.sort ?? "recommended"}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none rounded-full border border-[#ded8cb] bg-white px-4 py-2 pr-8 text-xs font-semibold text-neutral-800 shadow-xs hover:border-[#2b0934] focus:border-[#a813c9] focus:outline-none transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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

        {/* Catalog 4-Column Grid */}
        {items.length === 0 ? (
          <EmptyState
            title="No experiences match your search"
            description="Try a different date, a broader search term, or browse all categories instead."
            actionLabel="Browse all experiences"
            actionHref="/experiences"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((product, index) => (
                <ExperienceCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>

            {/* Infinite-scroll sentinel: loads the next 10 as it nears the viewport */}
            {hasMore && (
              <div ref={sentinelRef} className="mt-12 sm:mt-16 flex items-center justify-center py-4">
                {loadingMore && (
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#68736b]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        className="stroke-current opacity-25"
                        strokeWidth="3"
                        fill="none"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        className="stroke-current"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    Loading more experiences…
                  </div>
                )}
                {loadError && !loadingMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    className="text-xs font-semibold text-[#2b0934] underline underline-offset-2 hover:text-[#3d0d4a]"
                  >
                    Couldn&apos;t load more — tap to retry
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </Container>

      {/* Pre-Footer Callout Banner */}
      <div className="mt-16 sm:mt-20">
        <FlorenceCtaBanner />
      </div>
    </div>
  );
}
