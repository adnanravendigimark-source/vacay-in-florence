import type { HomepageContent } from "@/lib/types";

/**
 * Placeholder for the `cms_blocks` row keyed "homepage" that the Master
 * Admin will edit directly (hero copy, trust-section blurbs, CTA text).
 * Swapped for `prisma.cmsBlock.findUnique({ where: { key: "homepage" } })`
 * once Neon is connected — see src/lib/data/site-content.ts.
 */
export const homepageContent: HomepageContent = {
  hero: {
    eyebrow: "Florence, Italy",
    headline: "Florence, without the guesswork.",
    subheadline:
      "Skip-the-line tickets, small-group tours, and day trips — booked in minutes, confirmed instantly, and backed by free cancellation.",
    primaryCta: { label: "Browse experiences", href: "/experiences" },
    secondaryCta: { label: "How booking works", href: "/how-it-works" },
    stats: [
      { label: "Travelers booked", value: "250,000+" },
      { label: "Average rating", value: "4.8 / 5" },
      { label: "Free cancellation", value: "Up to 24h before" },
    ],
  },
  trust: {
    heading: "Why book with VACAY Florence",
    subheading:
      "We vet every listing and every supplier, so what you see here is what you get in Florence.",
    highlights: [
      {
        id: "trust_reviews",
        title: "Verified reviews only",
        description: "Every review comes from a completed, confirmed booking — no exceptions.",
        icon: "star",
      },
      {
        id: "trust_confirmation",
        title: "Instant confirmation",
        description: "Most tickets and tours confirm immediately, so you can plan the rest of your day.",
        icon: "clock",
      },
      {
        id: "trust_curation",
        title: "Handpicked experiences",
        description: "Every listing is vetted for quality before it goes live — not just anyone can list.",
        icon: "shield",
      },
      {
        id: "trust_support",
        title: "Local support, always on",
        description: "Real help in English and Italian if a booking needs to change.",
        icon: "support",
      },
      {
        id: "trust_cancellation",
        title: "Free cancellation",
        description: "Most experiences can be cancelled up to 24 hours ahead, no questions asked.",
        icon: "confirmation",
      },
    ],
  },
  cta: {
    heading: "Ready to see Florence properly?",
    subheading:
      "Browse skip-the-line tickets and guided experiences curated for first-time visitors and locals alike.",
    primaryCta: { label: "Explore all experiences", href: "/experiences" },
  },
};
