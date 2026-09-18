import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getFeaturedCategories } from "@/lib/data/categories";
import type { CategoryIcon } from "@/lib/types";

/**
 * Server Component: pulls the real, admin-managed category list rather
 * than a hardcoded array, so every tile links to a category page that
 * actually exists (/experiences/category/[slug]) and stays in sync with
 * whatever the Master Admin curates as "featured".
 */

const ICONS: Record<CategoryIcon, React.ReactNode> = {
  landmark: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current fill-none stroke-[1.75]">
      <path d="M12 3v18M8 21h8M5 17h14M7 13h10M9 9h6M11 5h2" />
      <path d="M6 21l6-18 6 18" />
    </svg>
  ),
  museum: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current fill-none stroke-[1.75]">
      <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L3 10h18L12 3z" />
    </svg>
  ),
  "tour-guide": (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current fill-none stroke-[1.75]">
      <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  "food-wine": (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current fill-none stroke-[1.75]">
      <path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5V3H7v7a5 5 0 0 0 5 5z" />
      <line x1="7" y1="8" x2="17" y2="8" />
    </svg>
  ),
  "day-trip": (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current fill-none stroke-[1.75]">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  outdoor: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current fill-none stroke-[1.75]">
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l4-9h4M10 17h8l-3-6-2.5 2" />
    </svg>
  ),
};

export async function CategoryGrid() {
  const categories = await getFeaturedCategories(6);

  return (
    <section className="border-b border-neutral-200/80 bg-[#faf9f6] py-10 sm:py-12">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/experiences/category/${category.slug}`}
              className="group flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100/90 text-[#142d22] ring-1 ring-neutral-200/70 transition-all duration-200 group-hover:scale-110 group-hover:bg-[#142d22] group-hover:text-white">
                {ICONS[category.icon]}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-neutral-900 group-hover:text-[#142d22]">
                {category.name}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{category.shortDescription}</p>
              <span className="mt-2 text-xs font-semibold text-neutral-400 group-hover:text-[#1c352d] transition-transform duration-150 group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
