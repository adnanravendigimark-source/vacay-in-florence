"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";

export function VipNewsletterV4() {
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
    <section className="bg-white py-16 sm:py-24">
      <Container>
        <div className="rounded-3xl bg-[#faf9f6] border border-[#eae5d9] p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-5 h-[1.5px] bg-[#183528]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#183528]">
              NEWSLETTER
            </span>
            <span className="w-5 h-[1.5px] bg-[#183528]" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
            Join the Florence Insider Club
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Subscribe to receive exclusive secret discounts, early timeslot alerts for the Duomo Dome, and our curated Florence guide.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 h-12 px-5 rounded-full bg-white border border-[#d5d1c8] text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#183528] shadow-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-12 px-7 rounded-full bg-[#183528] hover:bg-[#0e241a] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm shrink-0"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {status === "success" && (
            <p className="mt-3 text-xs font-semibold text-[#183528]">
              ✓ You&apos;re in! Welcome to the VACAY Florence family.
            </p>
          )}

          {status === "error" && (
            <p className="mt-3 text-xs font-semibold text-rose-600">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
