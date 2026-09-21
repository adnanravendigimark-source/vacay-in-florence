import Link from "next/link";
import { Container } from "@/components/ui/container";

export function FlorenceCtaBanner() {
  return (
    <div className="w-full py-8 sm:py-12">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-[#132319] px-6 py-10 sm:px-12 sm:py-14 text-white shadow-xl">
          {/* Subtle Botanical Olive Branch Illustration (Left) */}
          <div className="absolute -left-6 -bottom-8 opacity-20 pointer-events-none hidden md:block">
            <svg width="240" height="240" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 180 C 60 140, 100 100, 160 40" strokeLinecap="round" />
              <path d="M60 140 C 50 110, 70 90, 90 110 C 80 130, 60 140, 60 140" fill="currentColor" fillOpacity="0.4" />
              <path d="M100 100 C 90 70, 110 50, 130 70 C 120 90, 100 100, 100 100" fill="currentColor" fillOpacity="0.4" />
              <path d="M130 70 C 120 40, 140 20, 160 40 C 150 60, 130 70, 130 70" fill="currentColor" fillOpacity="0.4" />
              <path d="M80 120 C 110 130, 130 110, 110 90 C 90 100, 80 120, 80 120" fill="currentColor" fillOpacity="0.4" />
              <path d="M120 80 C 150 90, 170 70, 150 50 C 130 60, 120 80, 120 80" fill="currentColor" fillOpacity="0.4" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            {/* Left/Center Text */}
            <div className="max-w-xl mx-auto md:mx-0">
              <p className="font-display text-2xl sm:text-3xl text-neutral-100 font-normal leading-tight">
                More than just a trip —
              </p>
              <p className="font-display text-2xl sm:text-3xl italic text-[#ffe5a3] font-light mt-1">
                it&apos;s a Florence experience
              </p>
            </div>

            {/* Right Button */}
            <div className="shrink-0">
              <Link
                href="/experiences#categories"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/10 hover:bg-white hover:text-neutral-900 px-6 py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200 backdrop-blur-sm shadow-md"
              >
                <span>Explore Categories</span>
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                  <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
