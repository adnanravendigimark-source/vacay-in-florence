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
    <div className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-neutral-200/85 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Clickable Card Link covering whole card */}
      <Link href={`/experiences/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.title}>
        <span className="sr-only">View {product.title}</span>
      </Link>

      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <Image
          src={product.image.src}
          alt={product.image.alt || product.title}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

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
              : "bg-black/30 hover:bg-black/50 text-white border border-white/30"
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
          <div className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.14em] uppercase text-neutral-400">
            {product.categoryName || "MUSEUMS & GALLERIES"}
          </div>

          {/* Title */}
          <h3 className="font-display text-[16px] sm:text-[17px] font-semibold text-neutral-900 leading-snug line-clamp-2 mt-1 mb-2 group-hover:text-amber-900 transition-colors">
            {product.title}
          </h3>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-2.5">
            <span className="text-amber-500 text-sm">★</span>
            <span className="font-bold text-neutral-900">
              {product.ratingAverage ? product.ratingAverage.toFixed(1) : "4.8"}
            </span>
            <span className="text-neutral-400 text-[11px]">
              ({product.reviewCount ? product.reviewCount.toLocaleString() : "1,240"} reviews)
            </span>
          </div>

          {/* Meta Details: Duration & Group Type */}
          <div className="flex items-center gap-3 text-xs text-neutral-500 pb-3">
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.85]">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{product.durationLabel || "2 hours"}</span>
            </div>
            <span className="text-neutral-300">•</span>
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.85]">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Small group</span>
            </div>
          </div>
        </div>

        {/* Card Footer: Price & Arrow Button */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1 text-xs text-neutral-500">
            <span>From</span>
            <span className="font-display text-lg sm:text-xl font-bold text-neutral-900">
              €{product.priceFrom.amount}
            </span>
            <span className="text-[11px] text-neutral-400">per person</span>
          </div>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-[#132319] group-hover:text-white transition-colors duration-200">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.2]">
              <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
