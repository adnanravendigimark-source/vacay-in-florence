import Link from "next/link";
import { ExperienceCard } from "@/components/ui/experience-card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { buildHref } from "@/lib/url";
import type { SearchProductsResult, ProductSortOption } from "@/lib/data/products";
import type { CategorySummary } from "@/lib/types";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

/**
 * Shared listing UI for /experiences and /experiences/category/[slug] —
 * both pages fetch data server-side with searchProducts() and hand the
 * result to this component, so the grid, filters, pagination, and empty
 * state stay in exactly one place.
 */
export function ExperienceListing({
  basePath,
  result,
  categories,
  activeCategorySlug,
  currentParams,
  showCategoryFilters = true,
}: {
  basePath: string;
  result: SearchProductsResult;
  categories: CategorySummary[];
  activeCategorySlug?: string;
  currentParams: Record<string, string | undefined>;
  showCategoryFilters?: boolean;
}) {
  const { items, page, totalPages, total } = result;

  return (
    <div>
      {showCategoryFilters && categories.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {/* Categories are dedicated, indexable pages
              (/experiences/category/[slug]) rather than a ?category=
              query filter on /experiences — one canonical URL per
              category, no duplicate-content permutations. */}
          <Link
            href="/experiences"
            className={
              "rounded-full px-4 py-2 text-sm font-medium transition " +
              (!activeCategorySlug ? "bg-cypress text-white" : "bg-cream-deep text-ink-soft hover:bg-stone")
            }
          >
            All experiences
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/experiences/category/${category.slug}`}
              className={
                "rounded-full px-4 py-2 text-sm font-medium transition " +
                (activeCategorySlug === category.slug
                  ? "bg-cypress text-white"
                  : "bg-cream-deep text-ink-soft hover:bg-stone")
              }
            >
              {category.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-faint">
          {total === 0 ? "No experiences found" : `${total} experience${total === 1 ? "" : "s"} found`}
        </p>

        <form method="get" action={basePath} className="flex items-center gap-2">
          {Object.entries(currentParams).map(([key, value]) =>
            value && key !== "sort" && key !== "page" ? (
              <input key={key} type="hidden" name={key} value={value} />
            ) : null,
          )}
          <label htmlFor="sort" className="sr-only">
            Sort experiences
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={currentParams.sort ?? "recommended"}
            className="rounded-full border border-stone-dark bg-white px-3 py-2 text-sm text-ink-soft"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-cream-deep px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-stone"
          >
            Apply
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No experiences match your search"
          description="Try a different date, a broader search term, or browse all categories instead."
          actionLabel="Browse all experiences"
          actionHref="/experiences"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product, index) => (
              <ExperienceCard key={product.id} product={product} priority={index < 3} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(basePath, currentParams, { page: p === 1 ? undefined : p })}
          />
        </>
      )}
    </div>
  );
}
