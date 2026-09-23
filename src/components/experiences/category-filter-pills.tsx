import Link from "next/link";
import type { CategorySummary } from "@/lib/types";

function getCategoryIcon(slug: string) {
  switch (slug) {
    case "skip-the-line-attractions":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.85]">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "museums-galleries":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.85]">
          <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L2 10h20L12 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "guided-tours":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.85]">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "food-wine-experiences":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.85]">
          <path d="M8 22h8M12 15v7M8 3h8c0 4.418-2.686 8-6 8s-6-3.582-6-8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "day-trips-from-florence":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.85]">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <circle cx="7" cy="19" r="2" />
          <circle cx="17" cy="19" r="2" />
          <path d="M3 11h18M9 6v5M15 6v5" />
        </svg>
      );
    case "outdoor-active":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.85]">
          <path d="M8 3l4 8 5-5 5 11H2L8 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.85]">
          <circle cx="12" cy="12" r="10" />
          <polygon points="12 6 12 12 16 14" />
        </svg>
      );
  }
}

export function CategoryFilterPills({
  categories,
  activeCategorySlug,
}: {
  categories: CategorySummary[];
  activeCategorySlug?: string;
}) {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2.5 overflow-x-auto py-2 no-scrollbar scroll-smooth">
        {/* All Experiences Button */}
        <Link
          href="/experiences"
          className={`inline-flex items-center gap-2.5 shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
            !activeCategorySlug
              ? "bg-[#142d22] text-white shadow-md ring-1 ring-black/10 scale-[1.02]"
              : "bg-white text-neutral-700 hover:bg-[#f6f4ee] hover:text-neutral-900 border border-[#e4ded5] shadow-xs"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current opacity-85">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>All Experiences</span>
        </Link>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isActive = activeCategorySlug === cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/experiences/category/${cat.slug}`}
              className={`inline-flex items-center gap-2.5 shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#142d22] text-white shadow-md ring-1 ring-black/10 scale-[1.02]"
                  : "bg-white text-neutral-700 hover:bg-[#f6f4ee] hover:text-neutral-900 border border-[#e4ded5] shadow-xs"
              }`}
            >
              <span className={isActive ? "text-amber-300" : "text-[#142d22]"}>
                {getCategoryIcon(cat.slug)}
              </span>
              <span>{cat.name}</span>
              {typeof cat.productCount === "number" && cat.productCount > 0 && (
                <span
                  className={`ml-0.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#f2efe8] text-neutral-600"
                  }`}
                >
                  {cat.productCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
