"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import Link from "next/link";

export function ConversionVipBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("FLORENCE10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="bg-gradient-to-br from-[#0e241a] via-[#143224] to-[#0a1b13] text-white py-16 sm:py-20 relative overflow-hidden">
      {/* Decorative Gold Circles */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#faeedd]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        <div className="rounded-[36px] bg-white/5 border border-white/15 backdrop-blur-2xl p-8 sm:p-12 lg:p-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Text */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#faeedd]/20 px-3.5 py-1 text-xs font-semibold text-[#faeedd] mb-4">
              <span>SPECIAL TRAVELER WELCOME OFFER</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
              Get 10% Off Your First Florence Tour or Experience
            </h2>
            <p className="mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed">
              Use your exclusive discount code at checkout for immediate savings on all guided walking tours, Chianti wine day trips, and cooking classes.
            </p>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-medium text-white/90">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Instant checkout redemption
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> 100% Free 24h cancellation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> No booking fees
              </span>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="flex flex-col items-center gap-4 bg-white/10 border border-white/20 p-6 sm:p-8 rounded-3xl backdrop-blur-xl w-full max-w-sm shrink-0 text-center shadow-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#faeedd]">
              EXCLUSIVE PROMO CODE
            </span>

            {/* Promo Code Box */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center justify-between rounded-2xl bg-neutral-950/80 border border-white/25 px-5 py-3.5 text-center font-mono text-lg font-black tracking-widest text-amber-300 transition-all hover:bg-neutral-900 cursor-pointer shadow-inner"
            >
              <span>FLORENCE10</span>
              <span className="text-xs font-sans font-semibold text-white/70 bg-white/10 px-2.5 py-1 rounded-lg">
                {copied ? "✓ Copied!" : "Copy"}
              </span>
            </button>

            <Link
              href="/experiences"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#faeedd] py-3.5 text-sm font-bold text-neutral-900 shadow-lg hover:bg-white transition-all active:scale-95"
            >
              <span>Book Experiences Now</span>
              <span>&rarr;</span>
            </Link>

            <span className="text-[11px] text-white/60">
              Valid on all tour bookings this season
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
