"use client";

import { useState } from "react";
import Image from "next/image";

interface HeroImageCarouselProps {
  images: { src: string; alt: string }[];
  fallbackAlt: string;
}

// Cycles through every real photo the product actually has (never a fixed
// count — 1 image just renders with no controls, N images get prev/next
// arrows and a "01 / N" counter, matching however many were seeded).
export function HeroImageCarousel({ images, fallbackAlt }: HeroImageCarouselProps) {
  const slides = images.length > 0 ? images : [{ src: "/images/florence-hero.jpg", alt: fallbackAlt }];
  const [index, setIndex] = useState(0);

  function goPrev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <div className="absolute inset-0">
      {slides.map((slide, i) => (
        <Image
          key={slide.src + i}
          src={slide.src}
          alt={slide.alt || fallbackAlt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-500 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Legibility scrim — light touch so the photo stays bright and true-color */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* Carousel controls — only shown when there's more than one photo */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-10 z-20 flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm text-white transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="hidden sm:flex items-center gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-[3px] rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-2.5 bg-white/40"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm text-white transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <span className="text-xs font-semibold text-white/90 tracking-wide ml-1 tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
