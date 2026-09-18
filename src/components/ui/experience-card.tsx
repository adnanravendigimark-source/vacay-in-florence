import Image from "next/image";
import Link from "next/link";
import type { ProductCardSummary } from "@/lib/types";
import { ProductBadgePill } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { PriceTag } from "@/components/ui/price-tag";

export function ExperienceCard({ product, priority = false }: { product: ProductCardSummary; priority?: boolean }) {
  const primaryBadge = product.badges[0];

  return (
    <Link
      href={`/experiences/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-stone/60 transition hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-deep">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        {primaryBadge ? (
          <span className="absolute left-3 top-3">
            <ProductBadgePill badge={primaryBadge} />
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{product.categoryName}</p>
        <h3 className="font-display text-lg font-medium leading-snug text-ink">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-soft">{product.shortDescription}</p>
        <div className="mt-auto flex flex-col gap-2 pt-2">
          {product.ratingAverage ? (
            <RatingStars rating={product.ratingAverage} reviewCount={product.reviewCount} />
          ) : null}
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-faint">{product.durationLabel}</span>
            <PriceTag price={product.priceFrom} />
          </div>
        </div>
      </div>
    </Link>
  );
}
