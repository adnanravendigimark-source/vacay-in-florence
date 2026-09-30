import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getContactPageContent } from "@/lib/data/site-content";
import { resolveCanonical, resolveRobots } from "@/lib/seo";
import type { ContactPageContent } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContactPageContent();
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: resolveCanonical("/contact") },
    robots: resolveRobots(content.seo.noIndex ?? false),
    openGraph: content.seo.ogImage ? { images: [content.seo.ogImage] } : undefined,
  };
}

// Info-card icons are a fixed, small set the admin picks from (see the
// "icon" field in ContactPageContent.infoCards) rather than free-typed
// SVG/markup — same reasoning as the homepage's TrustHighlight icon enum.
const ICONS: Record<ContactPageContent["infoCards"][number]["icon"], React.ReactNode> = {
  help: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path
        d="M4 13a8 8 0 0 1 16 0M4 13v4a2 2 0 0 0 2 2h1v-6H5a1 1 0 0 0-1 1Zm16 0v4a2 2 0 0 1-2 2h-1v-6h1a1 1 0 0 1 1 1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  partnership: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <rect x="3" y="7" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default async function ContactPage() {
  const content = await getContactPageContent();

  return (
    <div className="bg-cream-deep/40 py-14 sm:py-20">
      <Container className="max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-terracotta/30 bg-terracotta-light px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
            {content.hero.badge}
          </span>
          <h1 className="mt-4 font-display text-3xl font-medium text-ink sm:text-4xl">{content.hero.headline}</h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-ink-soft">{content.hero.subheadline}</p>
        </div>

        {/* Email card */}
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-cream-deep to-white p-8 text-center shadow-[var(--shadow-card)] ring-1 ring-stone/60 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9e0ca0] shadow-md">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-white stroke-[1.8]">
              <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {content.emailLabel}
          </p>
          <a
            href={`mailto:${content.email}`}
            className="mt-1 inline-block text-xl font-bold text-terracotta transition-colors hover:text-terracotta-dark sm:text-2xl"
          >
            {content.email}
          </a>
          <p className="mt-3 text-sm text-ink-soft">{content.emailNote}</p>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {content.infoCards.map((card) => (
            <div key={card.id} className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta-light text-terracotta">
                {ICONS[card.icon]}
              </div>
              <h3 className="mt-3 text-sm font-bold text-ink">{card.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Existing booking note */}
        <div className="mt-10 border-t border-stone pt-8 text-center">
          <p className="text-sm text-ink-soft">{content.existingBookingNote}</p>
        </div>

        {/* Not booked yet CTA */}
        <div className="relative mt-8 overflow-hidden rounded-3xl bg-white border border-[#e8e2eb] p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-800">{content.ctaEyebrow}</p>
            <Link
              href={content.ctaButtonHref}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#9e0ca0] hover:bg-[#850b9e] px-6 py-3.5 text-xs font-semibold text-white shadow-md transition-all hover:scale-105 sm:text-sm"
            >
              <span>{content.ctaButtonLabel}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
