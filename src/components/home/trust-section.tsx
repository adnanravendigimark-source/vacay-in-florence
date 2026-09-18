import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TrustIconGlyph } from "@/components/ui/trust-icon";
import { getHomepageContent } from "@/lib/data/site-content";

export async function TrustSection() {
  const { trust } = await getHomepageContent();

  return (
    <section aria-labelledby="trust-heading" className="bg-ink py-16 text-cream">
      <Container>
        <div id="trust-heading">
          <SectionHeading align="center" tone="inverted" title={trust.heading} description={trust.subheading} />
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {trust.highlights.map((highlight) => (
            <li key={highlight.id} className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-gold-light">
                <TrustIconGlyph icon={highlight.icon} />
              </span>
              <h3 className="mt-4 font-display text-base font-medium">{highlight.title}</h3>
              <p className="mt-2 text-sm text-cream/70">{highlight.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
