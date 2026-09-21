"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";

export function VipBannerV3() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-white py-16 sm:py-24 border-t border-[#eae5d9]/80">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-[#faf9f6] text-[#18181b] p-8 sm:p-12 lg:p-16 border border-[#e5e0d8] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          {/* Subtle Warm Amber Atmospheric Accents */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 rounded-full bg-[#fbf0eb] blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-80 h-80 rounded-full bg-[#fef3c7]/60 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-[#c85a32] text-xs font-bold tracking-widest uppercase mb-4 border border-[#e5e0d8] shadow-sm">
              ✨ JOIN THE FLORENCE INSIDERS CLUB
            </span>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#18181b] leading-[1.12]">
              Unlock 10% Off Your First Florence Booking
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#52525b] leading-relaxed max-w-xl mx-auto">
              Get instant secret discounts, early-access timeslot releases for the Duomo Dome, and our curated 2026 Florence Insider PDF Guide.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 h-13 px-5 rounded-full bg-white border border-[#e5e0d8] text-[#18181b] placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#c85a32] shadow-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="h-13 px-7 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shrink-0 disabled:opacity-50"
              >
                {status === "loading" ? "Subscribing..." : "Get 10% Off"}
              </button>
            </form>

            {status === "success" && (
              <p className="mt-4 text-xs font-semibold text-[#c85a32]">
                ✓ Check your inbox! Your 10% promo code is on the way.
              </p>
            )}

            {status === "error" && (
              <p className="mt-4 text-xs font-semibold text-rose-600">
                Something went wrong. Please try again.
              </p>
            )}

            <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-[#71717a]">
              <span>🔒 100% Privacy Protected</span>
              <span>•</span>
              <span>⚡ Instant Promo Code</span>
              <span>•</span>
              <span>🚫 No Spam Ever</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
