import Link from "next/link";
import Image from "next/image";
import type { ProductCardSummary } from "@/lib/types";
import { ProductBadgePill } from "@/components/ui/badge";

/**
 * Horizontal ticket-list row for the redesigned attraction listing page —
 * image thumb + badge, content column, price + CTA column. Same color
 * tokens as the rest of the site (ExperienceCard, the single-product
 * hero): #9e0ca0 accent, font-display headings, #e8e3d8 borders — just a
 * row layout instead of a grid card, to match the reference design.
 */
export function AttractionTicketRow({ product }: { product: ProductCardSummary }) {
  const primaryBadge = product.badges?.[0];

  return (
    <Link
      href={`/experiences/${product.slug}`}
      className="group flex flex-col sm:flex-row gap-4 sm:gap-5 rounded-2xl border border-[#e8e3d8] bg-white p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full sm:w-56 shrink-0 aspect-[4/3] sm:aspect-[4/3] overflow-hidden rounded-xl bg-[#f4f2ec]">
        <Image
          src={product.image.src}
          alt={product.image.alt || product.title}
          fill
          sizes="(min-width: 640px) 224px, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {primaryBadge && (
          <div className="absolute left-2.5 top-2.5">
            <ProductBadgePill badge={primaryBadge} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <h3 className="font-display text-lg sm:text-xl font-semibold text-neutral-900 leading-snug group-hover:text-[#9e0ca0] transition-colors">
          {product.title}
        </h3>
        <p className="mt-1 text-sm text-[#5f6b61] leading-relaxed line-clamp-2">{product.shortDescription}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-600">
          {product.ratingAverage ? (
            <span className="inline-flex items-center gap-1">
              <span className="text-amber-500">★</span>
              <span className="font-bold text-neutral-900">{product.ratingAverage.toFixed(1)}</span>
              <span className="text-neutral-400">({product.reviewCount.toLocaleString()})</span>
            </span>
          ) : (
            <span className="rounded-full bg-[#fdf2fe] px-2 py-0.5 text-[10.5px] font-bold text-[#9e0ca0] border border-[#ede7ef]">
              New
            </span>
          )}
          <span className="text-neutral-300">•</span>
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.85]">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {product.durationLabel}
          </span>
          {product.badges.includes("free-cancellation") && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="inline-flex items-center gap-1 text-[#9e0ca0] font-medium">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Free cancellation
              </span>
            </>
          )}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex shrink-0 flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-[#ede9e1] pt-3 sm:pt-0 sm:pl-5 sm:w-40">
        <div className="text-left sm:text-right">
          <div className="text-[11px] text-neutral-500">From</div>
          <div className="font-display text-xl sm:text-2xl font-bold text-neutral-900">
            €{product.priceFrom.amount}
          </div>
          <div className="text-[11px] text-neutral-400">/ person</div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf2fe] text-[#9e0ca0] group-hover:bg-[#9e0ca0] group-hover:text-white transition-all duration-200 shadow-xs shrink-0">
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
            <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
