"use client";

import { useRouter } from "next/navigation";
import { ExperienceCard } from "@/components/ui/experience-card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryFilterPills } from "@/components/experiences/category-filter-pills";
import { FlorenceCtaBanner } from "@/components/experiences/florence-cta-banner";
import { Container } from "@/components/ui/container";
import { buildHref } from "@/lib/url";
import type { SearchProductsResult, ProductSortOption } from "@/lib/data/products";
import type { CategorySummary } from "@/lib/types";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

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
  const { items, page, totalPages, total } = result;

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
    (activeCategory ? `${activeCategory.name} in Florence` : "All Experiences in Florence");
  const sectionSubtitle =
    subtitleOverride ||
    (activeCategory
      ? activeCategory.shortDescription
      : "From world-famous museums to hidden gems, find the perfect experience for your Florence adventure.");

  return (
    <div className="w-full bg-[#faf9f6] pt-12 pb-16">
      <Container>
        {/* Category Filters Ribbon */}
        {showCategoryFilters && categories.length > 0 && (
          <div id="categories" className="mb-10 scroll-mt-28">
            <CategoryFilterPills categories={categories} activeCategorySlug={activeCategorySlug} />
          </div>
        )}

        {/* Section Title & Sort Controls */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-medium text-neutral-900 leading-tight">
              {sectionTitle}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-xl leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs text-neutral-500 font-medium">Sort by</span>
            <div className="relative">
              <select
                value={currentParams.sort ?? "recommended"}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2 pr-8 text-xs font-semibold text-neutral-800 shadow-xs focus:border-neutral-900 focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-currentColor">
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

            {/* Centered Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => buildHref(basePath, currentParams, { page: p === 1 ? undefined : p })}
            />
          </>
        )}
      </Container>

      {/* Pre-Footer Callout Banner */}
      <div className="mt-14 sm:mt-18">
        <FlorenceCtaBanner />
      </div>
    </div>
  );
}
