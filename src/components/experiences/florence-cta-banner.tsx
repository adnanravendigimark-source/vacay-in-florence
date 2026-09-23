import Link from "next/link";
import { Container } from "@/components/ui/container";

export function FlorenceCtaBanner({
  primaryLabel = "Browse All Categories",
  primaryHref = "/categories",
}: {
  primaryLabel?: string;
  primaryHref?: string;
} = {}) {
  return (
    <div className="w-full py-6 sm:py-10">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-white p-8 sm:p-12 lg:p-14 border border-[#e5dfd4] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          {/* Subtle Duomo Silhouette Watermark in Background */}
          <div className="absolute right-4 -bottom-6 opacity-[0.06] pointer-events-none select-none hidden md:block">
            <svg viewBox="0 0 100 100" className="h-64 w-64 fill-[#142d22]">
              <path d="M50 5 L55 20 L45 20 Z" />
              <path d="M25 60 C25 35 40 20 50 20 C60 20 75 35 75 60 Z" />
              <rect x="20" y="60" width="60" height="25" rx="2" />
              <rect x="15" y="85" width="70" height="10" rx="1" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            {/* Left/Center Text */}
            <div className="max-w-xl mx-auto md:mx-0">
              <div className="inline-flex items-center gap-2 text-[10.5px] sm:text-[11px] font-bold tracking-[0.2em] text-[#6b766d] uppercase mb-2">
                <span>LOCAL FLORENTINE CONCIERGE</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-[34px] text-[#142d22] font-normal leading-tight">
                Need help planning your <span className="italic font-light">Florence visit?</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#5a665d] leading-relaxed max-w-lg">
                Our local Florence team is available 7 days a week to help arrange custom private tours, group tickets, and personalized Tuscan itineraries.
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 rounded-full bg-[#142d22] hover:bg-[#0c1f16] px-6 py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{primaryLabel}</span>
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                  <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#ded8cb] bg-white hover:bg-[#f6f4ee] px-5 py-3 text-xs sm:text-sm font-semibold text-[#142d22] transition-all duration-200 shadow-xs cursor-pointer"
              >
                <span>Contact Concierge</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
