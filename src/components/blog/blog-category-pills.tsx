"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BlogCategorySummary } from "@/lib/types";

type IconComponent = (props: { className?: string }) => React.JSX.Element;

// Decorative icons keyed by category slug — purely cosmetic. The actual
// list of categories rendered below always comes from the 'categories'
// prop (real DB data via getBlogCategories()), never from this map: a
// slug with no entry here just gets GENERIC_ICON, so a category an admin
// adds/renames/removes in the CMS is reflected immediately either way.
const ALL_ICON: IconComponent = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1.5" />
    <rect width="7" height="7" x="14" y="3" rx="1.5" />
    <rect width="7" height="7" x="14" y="14" rx="1.5" />
    <rect width="7" height="7" x="3" y="14" rx="1.5" />
  </svg>
);

const GENERIC_ICON: IconComponent = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3a1 1 0 0 0-1 1l.24 5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.82Z" />
    <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const ICON_BY_SLUG: Record<string, IconComponent> = {
  itineraries: ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
      <path d="M15 5.764v15" />
      <path d="M9 3.236v15" />
    </svg>
  ),
  "day-trips": ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  ),
  "tickets-tips": ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  ),
  "food-wine": ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  "culture-history": ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="11" y2="18" />
      <line x1="10" x2="10" y1="11" y2="18" />
      <line x1="14" x2="14" y1="11" y2="18" />
      <line x1="18" x2="18" y1="11" y2="18" />
      <polygon points="12 2 20 7 4 7" />
      <line x1="2" x2="22" y1="7" y2="7" />
    </svg>
  ),
  "travel-tips": ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  ),
};

export function BlogCategoryPills({
  categories = [],
  activeCategorySlug,
}: {
  categories?: BlogCategorySummary[];
  activeCategorySlug?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "latest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.push(`${pathname}${query}#articles`);
  };

  // Real categories from the database (getBlogCategories(), grouped from
  // actual blog_posts rows), with a synthetic "All Articles" pill always
  // first. Nothing here is a hardcoded category list — add, rename, or
  // remove a category in the CMS and this bar reflects it on next load.
  const pills = [
    { name: "All Articles", slug: "", icon: ALL_ICON },
    ...categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      icon: ICON_BY_SLUG[cat.slug] ?? GENERIC_ICON,
    })),
  ];

  return (
    <div className="w-full pt-8 pb-4">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Category Icons Row */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto py-3 px-1 no-scrollbar">
          {pills.map((cat) => {
            const isActive = (!activeCategorySlug && cat.slug === "") || activeCategorySlug === cat.slug;
            const href = cat.slug === "" ? "/blog#articles" : `/blog/category/${cat.slug}#articles`;
            const Icon = cat.icon;

            return (
              <Link
                key={cat.slug || "all"}
                href={href}
                className="group flex flex-col items-center gap-2 shrink-0 select-none transition-transform active:scale-95"
              >
                <div
                  className={`flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#2B0934] text-white shadow-md ring-2 ring-[#2B0934]/20"
                      : "bg-[#F3EFE9] text-neutral-700 hover:bg-[#EAE4DC] hover:text-neutral-900 hover:scale-105"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs tracking-tight transition-colors ${
                    isActive
                      ? "font-bold text-neutral-900"
                      : "font-medium text-neutral-500 group-hover:text-neutral-900"
                  }`}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
          <div className="relative">
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="appearance-none rounded-full border border-stone-200/90 bg-white py-1.5 pl-3.5 pr-8 text-xs font-semibold text-neutral-800 shadow-xs hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#a813c9] cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="oldest">Oldest</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
