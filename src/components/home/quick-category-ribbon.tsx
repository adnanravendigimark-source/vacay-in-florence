import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getFeaturedCategories } from "@/lib/data/categories";
import type { CategoryIcon } from "@/lib/types";

const ICONS: Record<CategoryIcon, React.ReactNode> = {
  landmark: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.85]">
      <path d="M12 3v18M8 21h8M5 17h14M7 13h10M9 9h6M11 5h2" />
      <path d="M6 21l6-18 6 18" />
    </svg>
  ),
  museum: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.85]">
      <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L3 10h18L12 3z" />
    </svg>
  ),
  "tour-guide": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.85]">
      <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  "food-wine": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.85]">
      <path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5V3H7v7a5 5 0 0 0 5 5z" />
      <line x1="7" y1="8" x2="17" y2="8" />
    </svg>
  ),
  "day-trip": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.85]">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  outdoor: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.85]">
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l4-9h4M10 17h8l-3-6-2.5 2" />
    </svg>
  ),
};

interface QuickCategoryRibbonProps {
  content?: {
    categoriesBadge?: string;
    categoriesTitle?: string;
    categoriesSubtitle?: string;
    categoriesLimit?: number;
  };
}

export async function QuickCategoryRibbon({ content }: QuickCategoryRibbonProps) {
  const categories = await getFeaturedCategories(content?.categoriesLimit || 6);
  const title = content?.categoriesTitle || "Explore Florence by Theme";
  const badge = content?.categoriesBadge;
  const subtitle = content?.categoriesSubtitle;

  return (
    <section className="border-b border-neutral-200/80 bg-[#faf9f6] py-6 sm:py-8">
      <Container>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            {badge ? (
              <span className="inline-block mb-1 text-[10px] font-bold uppercase tracking-widest text-[#2b0934]/70">
                {badge}
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2b0934]" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                {title}
              </span>
            </div>
            {subtitle ? (
              <p className="mt-1 text-[11px] text-neutral-500 max-w-md">{subtitle}</p>
            ) : null}
          </div>
          <Link
            href="/experiences"
            className="text-xs font-semibold text-[#2b0934] hover:underline shrink-0"
          >
            All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/experiences/category/${category.slug}`}
              className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#2b0934]/40 hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[#2b0934] transition-all duration-200 group-hover:bg-[#2b0934] group-hover:text-white">
                {ICONS[category.icon]}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold leading-snug text-neutral-900 group-hover:text-[#2b0934]">
                  {category.name}
                </h3>
                <p className="text-[10.5px] text-neutral-500 truncate">
                  {category.productCount} experience{category.productCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
