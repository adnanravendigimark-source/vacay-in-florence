"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductCardSummary } from "@/lib/types";
import { ProductBadgePill } from "@/components/ui/badge";

export function ExperienceCard({
  product,
  priority = false,
}: {
  product: ProductCardSummary;
  priority?: boolean;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const primaryBadge = product.badges?.[0] || "skip-the-line";

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-[#e8e3d8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300">
      {/* Clickable Card Link covering whole card */}
      <Link href={`/experiences/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.title}>
        <span className="sr-only">View {product.title}</span>
      </Link>

      {/* Image Container with Editorial Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f4f2ec]">
        <Image
          src={product.image.src}
          alt={product.image.alt || product.title}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Soft Vignette Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top-Left Category Badge */}
        <div className="absolute left-3 top-3 z-10 pointer-events-none">
          <ProductBadgePill badge={primaryBadge} />
        </div>

        {/* Top-Right Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isLiked
              ? "bg-rose-500 text-white shadow-md scale-110"
              : "bg-black/35 hover:bg-black/55 text-white border border-white/35"
          }`}
          aria-label="Add to wishlist"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-4.5 justify-between pointer-events-none">
        <div>
          {/* Category Tag */}
          <div className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#738076]">
            {product.categoryName}
          </div>

          {/* Title */}
          <h3 className="font-display text-[16px] sm:text-[17px] font-semibold text-neutral-900 leading-snug line-clamp-2 mt-1 mb-2 group-hover:text-[#142d22] transition-colors">
            {product.title}
          </h3>

          {/* Star Rating & Review Count (honest empty state — never fabricates a rating) */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-2.5">
            {product.ratingAverage ? (
              <>
                <span className="text-amber-500 text-sm">★</span>
                <span className="font-bold text-neutral-900">{product.ratingAverage.toFixed(1)}</span>
                <span className="text-neutral-400 text-[11px]">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              </>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200/60">
                New
              </span>
            )}
          </div>

          {/* Meta Details: Duration & Free Cancellation */}
          <div className="flex items-center gap-3 text-xs text-[#667268] pb-3">
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.85]">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{product.durationLabel}</span>
            </div>
            <span className="text-neutral-300">•</span>
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Free Cancel</span>
            </div>
          </div>
        </div>

        {/* Card Footer: Price & Direct Arrow Button */}
        <div className="mt-auto pt-3 border-t border-[#ede9e1] flex items-center justify-between">
          <div className="flex items-baseline gap-1 text-xs text-neutral-500">
            <span className="text-[11px]">From</span>
            <span className="font-display text-lg sm:text-xl font-bold text-neutral-900">
              €{product.priceFrom.amount}
            </span>
            <span className="text-[11px] text-neutral-400">/ person</span>
          </div>

          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[#f4f2ec] text-[#142d22] group-hover:bg-[#142d22] group-hover:text-white transition-all duration-200 shadow-xs">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.2]">
              <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
