import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getFeaturedExperiences } from "@/lib/data/products";
import type { ProductBadge } from "@/lib/types";

/**
 * Server Component: pulls real, admin-curated `featured` products (the
 * `(status, featured, featuredRank)` index on the products table) instead
 * of a hardcoded list, so every card links to a product page that
 * actually exists.
 */

const BADGE_LABEL: Record<ProductBadge, string> = {
  "free-cancellation": "Free Cancellation",
  "skip-the-line": "Skip the Line",
  "best-seller": "Bestseller",
  "small-group": "Small Group",
  "instant-confirmation": "Instant Confirmation",
};

const BADGE_COLOR: Record<ProductBadge, string> = {
  "free-cancellation": "bg-neutral-900 text-white",
  "skip-the-line": "bg-[#1c352d] text-white",
  "best-seller": "bg-terracotta text-white",
  "small-group": "bg-neutral-900 text-white",
  "instant-confirmation": "bg-[#1c352d] text-white",
};

const priceFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export async function FeaturedExperiences() {
  const experiences = await getFeaturedExperiences(4);

  if (experiences.length === 0) return null;

  return (
    <section className="bg-white py-14 sm:py-18">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-neutral-900 tracking-tight">
              Featured Experiences
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600">
              Handpicked experiences for an unforgettable stay in Florence.
            </p>
          </div>
          <Link
            href="/experiences"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-900 hover:text-terracotta transition-colors group"
          >
            <span>View All Experiences</span>
            <span className="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((exp, index) => {
            const primaryBadge = exp.badges[0];
            return (
              <Link
                key={exp.id}
                href={`/experiences/${exp.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-stone/60 shadow-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={exp.image.src}
                    alt={exp.image.alt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {primaryBadge ? (
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm ${BADGE_COLOR[primaryBadge]}`}
                    >
                      {BADGE_LABEL[primaryBadge]}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  {exp.ratingAverage ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-amber-500 font-bold">&#9733; {exp.ratingAverage.toFixed(1)}</span>
                      <span className="text-neutral-500">({exp.reviewCount.toLocaleString()} reviews)</span>
                    </div>
                  ) : null}

                  <h3 className="mt-2 text-sm sm:text-[15px] font-semibold leading-snug text-neutral-900 group-hover:text-[#1c352d] transition-colors line-clamp-2">
                    {exp.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {exp.durationLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-none stroke-current stroke-2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {exp.categoryName}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-500">From </span>
                      <span className="text-base font-bold text-neutral-900">
                        {priceFormatter.format(exp.priceFrom.amount)}
                      </span>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-[#1c352d] group-hover:text-white">
                      <span className="text-xs">&rarr;</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
