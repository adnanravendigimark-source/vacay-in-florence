"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import Link from "next/link";

interface ConversionVipBannerProps {
  content?: {
    ctaBadge?: string;
    ctaTitle?: string;
    ctaSubtitle?: string;
    ctaButtonText?: string;
    ctaButtonLink?: string;
    ctaSecondaryButtonText?: string;
    ctaSecondaryButtonLink?: string;
    ctaBackgroundImage?: string;
    ctaPromoCode?: string;
  };
}

export function ConversionVipBanner({ content }: ConversionVipBannerProps) {
  const [copied, setCopied] = useState(false);

  const badge = content?.ctaBadge || "LIMITED SUMMER AVAILABILITY";
  const title = content?.ctaTitle || "Don't Risk Sold-Out Florentine Museums";
  const subtitle =
    content?.ctaSubtitle ||
    "Uffizi and Accademia peak tickets sell out up to 3 weeks in advance. Reserve your priority time slot today with free cancellation protection.";
  const buttonText = content?.ctaButtonText || "Check Live Availability";
  const buttonLink = content?.ctaButtonLink || "/experiences";
  const secondaryText = content?.ctaSecondaryButtonText;
  const secondaryLink = content?.ctaSecondaryButtonLink || "/experiences/category/day-trips";
  const backgroundImage = content?.ctaBackgroundImage;
  const promoCode = content?.ctaPromoCode || "FLORENCE10";

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="bg-cream text-ink py-16 sm:py-20 relative overflow-hidden">
      {backgroundImage ? (
        <div className="absolute inset-0 z-0">
          <Image src={backgroundImage} alt="" fill className="object-cover opacity-[0.07]" />
        </div>
      ) : null}
      {/* Decorative Soft Circles */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold-light/70 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cypress-light/70 blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        <div className="rounded-[36px] bg-white border border-stone p-8 sm:p-12 lg:p-16 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Text */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold-light px-3.5 py-1 text-xs font-semibold text-gold mb-4">
              <span>{badge}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink leading-tight">
              {title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-ink-soft leading-relaxed">
              {subtitle}
            </p>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-medium text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="text-cypress">✓</span> Instant checkout redemption
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-cypress">✓</span> 100% Free 24h cancellation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-cypress">✓</span> No booking fees
              </span>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="flex flex-col items-center gap-4 bg-cream border border-stone p-6 sm:p-8 rounded-3xl w-full max-w-sm shrink-0 text-center shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              EXCLUSIVE PROMO CODE
            </span>

            {/* Promo Code Box */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center justify-between rounded-2xl bg-ink border border-ink/20 px-5 py-3.5 text-center font-mono text-lg font-black tracking-widest text-gold-light transition-all hover:bg-ink/90 cursor-pointer shadow-inner"
            >
              <span>{promoCode}</span>
              <span className="text-xs font-sans font-semibold text-cream/80 bg-white/10 px-2.5 py-1 rounded-lg">
                {copied ? "✓ Copied!" : "Copy"}
              </span>
            </button>

            <Link
              href={buttonLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cypress py-3.5 text-sm font-bold text-white shadow-lg hover:bg-cypress/90 transition-all active:scale-95"
            >
              <span>{buttonText}</span>
              <span>&rarr;</span>
            </Link>

            {secondaryText ? (
              <Link
                href={secondaryLink}
                className="text-xs font-semibold text-ink-soft hover:text-ink underline underline-offset-2"
              >
                {secondaryText}
              </Link>
            ) : null}

            <span className="text-[11px] text-ink-faint">
              Valid on all tour bookings this season
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
