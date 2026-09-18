import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAboutPageContent } from "@/lib/data/site-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "VACAY Florence is a small, Florence-based team that vets every experience in person before it goes live — no resale inventory, no affiliate feeds.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return (
    <>
      <div className="bg-cream-deep/40 py-14 sm:py-20">
        <Container className="max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-terracotta">
            {content.hero.eyebrow}
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-ink sm:text-5xl">
            {content.hero.headline}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">{content.hero.subheadline}</p>
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60 sm:grid-cols-4 sm:p-8">
          {content.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl font-medium text-ink sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-ink-faint sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20">
          <SectionHeading title={content.story.heading} />
          <div className="mt-6 space-y-4">
            {content.story.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <SectionHeading align="center" title="What we hold ourselves to" />
          <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            {content.values.map((value) => (
              <li key={value.id} className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
                <h3 className="font-display text-lg font-medium text-ink">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-2xl bg-ink px-6 py-10 text-center sm:mt-20 sm:px-10">
          <h2 className="font-display text-2xl font-medium text-cream sm:text-3xl">See it for yourself</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-cream/75">
            Every experience on this site has been vetted by our own team — browse the catalog and judge for yourself.
          </p>
          <Link
            href="/experiences"
            className="mt-6 inline-block rounded-full bg-cream px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Browse experiences
          </Link>
        </div>
      </Container>
    </>
  );
}
