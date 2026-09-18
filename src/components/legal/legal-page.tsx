import { Container } from "@/components/ui/container";
import type { LegalPageContent } from "@/lib/types";

/** Shared renderer for Privacy Policy, Terms & Conditions, and the
 * Cancellation & Refund Policy — same content shape, same layout. */
export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <Container className="max-w-3xl py-14 sm:py-20">
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">{content.title}</h1>
      <p className="mt-2 text-sm text-ink-faint">Effective {content.effectiveDate}</p>
      <p className="mt-6 text-base leading-relaxed text-ink-soft">{content.intro}</p>

      <div className="mt-10 space-y-10">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl font-medium text-ink">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
