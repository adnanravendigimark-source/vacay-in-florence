import Link from "next/link";
import type { BlogCategorySummary } from "@/lib/types";

export function BlogCategoryPills({
  categories,
  activeCategorySlug,
}: {
  categories: BlogCategorySummary[];
  activeCategorySlug?: string;
}) {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2.5 overflow-x-auto py-2 no-scrollbar scroll-smooth">
        <Link
          href="/blog"
          className={`inline-flex items-center gap-2 shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 ${
            !activeCategorySlug
              ? "bg-cypress text-white shadow-md ring-1 ring-black/10"
              : "bg-white text-neutral-700 hover:bg-cream-deep hover:text-ink border border-stone-dark/60 shadow-xs"
          }`}
        >
          All Articles
        </Link>
        {categories.map((category) => {
          const isActive = activeCategorySlug === category.slug;
          return (
            <Link
              key={category.slug}
              href={`/blog/category/${category.slug}`}
              className={`inline-flex items-center gap-2 shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-cypress text-white shadow-md ring-1 ring-black/10"
                  : "bg-white text-neutral-700 hover:bg-cream-deep hover:text-ink border border-stone-dark/60 shadow-xs"
              }`}
            >
              <span>{category.name}</span>
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-cream-deep text-ink-soft"
                }`}
              >
                {category.postCount}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
