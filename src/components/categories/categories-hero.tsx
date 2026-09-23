"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { CategorySummary } from "@/lib/types";

interface CategoriesHeroProps {
  categories: CategorySummary[];
}

// Curated hero imagery per category, kept distinct from the photos already
// used on /experiences (hero-david.jpg, hero-food-wine.jpg, hero-day-trips.jpg,
// hero-florence-duomo.jpg) so the two hero sections don't look like copies of
// each other. Falls back to the category's own DB image for anything not
// listed here.
const MOSAIC_IMAGE: Record<string, string> = {
  "skip-the-line-attractions": "/images/hero2-duomo-terrace.jpg",
  "museums-galleries": "/images/hero2-uffizi-corridor.jpg",
  "guided-tours": "/images/hero2-guided-tour.jpg",
  "food-wine-experiences": "/images/hero2-chianti-wine.jpg",
  "day-trips-from-florence": "/images/hero2-florence-panorama.jpg",
};

export function CategoriesHero({ categories }: CategoriesHeroProps) {
  const mosaicCategories = categories.slice(0, 5);
  const mobileCategory = categories[0];

  return (
    <section className="relative w-full bg-white pt-12 sm:pt-16 pb-12 sm:pb-16 border-b border-[#ece6dc]/80 overflow-hidden">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container className="relative z-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-neutral-500">
            <li>
              <Link href="/" className="hover:text-neutral-900 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400">/</li>
            <li className="font-semibold text-neutral-900">Categories</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Text Column */}
          <div className="lg:col-span-7 xl:col-span-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#556358] uppercase mb-3">
              <span>CURATED COLLECTIONS</span>
              <span className="text-amber-600 font-bold">•</span>
              <span>DISCOVER BY PASSION</span>
            </div>

            {/* Main Title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal leading-[1.1] tracking-tight text-[#2b0934]">
              Explore Florence by{" "}
              <span className="italic font-normal font-display text-[#2b0934]">Category</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#59655d] max-w-2xl">
              Choose your journey through the Renaissance capital. Whether you are seeking priority
              tickets to world-renowned galleries, insider wine tastings in the Chianti hills, or
              hidden walking routes with licensed historians, find your perfect experience below.
            </p>
          </div>

          {/* Mosaic Photo Collage — Desktop Only */}
          {mosaicCategories.length > 0 && (
            <div className="hidden lg:block lg:col-span-5 xl:col-span-6">
              <div className="grid grid-cols-2 grid-rows-3 gap-3 h-[380px] xl:h-[420px]">
                {mosaicCategories.map((category, idx) => {
                  const image = MOSAIC_IMAGE[category.slug] || category.image.src;
                  return (
                    <Link
                      key={category.id}
                      href={`/experiences/category/${category.slug}`}
                      className={`group relative overflow-hidden rounded-2xl border border-neutral-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.16)] ${
                        idx === 0 ? "row-span-2" : ""
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${category.name} in Florence`}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                      <span className="absolute bottom-2.5 left-2.5 right-2.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-[11px] sm:text-xs font-bold text-neutral-900 shadow-md text-center truncate">
                        {category.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Single Photo */}
        {mobileCategory && (
          <Link
            href={`/experiences/category/${mobileCategory.slug}`}
            className="lg:hidden mt-6 relative block h-40 sm:h-48 w-full overflow-hidden rounded-2xl border border-neutral-200/70 shadow-sm"
          >
            <img
              src={MOSAIC_IMAGE[mobileCategory.slug] || mobileCategory.image.src}
              alt={`${mobileCategory.name} in Florence`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-neutral-900 shadow-md">
              {mobileCategory.name}
            </span>
          </Link>
        )}
      </Container>
    </section>
  );
}
