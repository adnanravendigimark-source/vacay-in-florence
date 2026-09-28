import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FormField, FormTextArea, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { getAffiliatePageContent } from "@/lib/data/site-content";
import { resolveCanonical, resolveRobots } from "@/lib/seo";
import { submitAffiliateApplicationAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAffiliatePageContent();
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: resolveCanonical("/affiliates") },
    robots: resolveRobots(content.seo.noIndex ?? false),
    openGraph: content.seo.ogImage ? { images: [content.seo.ogImage] } : undefined,
  };
}

// See become-a-supplier/page.tsx's FIELD_META comment — same fixed
// input-kind mapping, admin only controls label/placeholder/required/visible.
const FIELD_META: Record<string, { kind: "input" | "textarea"; type?: string; autoComplete?: string; rows?: number }> = {
  name: { kind: "input", type: "text", autoComplete: "name" },
  email: { kind: "input", type: "email", autoComplete: "email" },
  phone: { kind: "input", type: "tel", autoComplete: "tel" },
  company: { kind: "input", type: "text", autoComplete: "organization" },
  website: { kind: "input", type: "url" },
  audienceSize: { kind: "input", type: "text" },
  message: { kind: "textarea", rows: 3 },
};

export default async function AffiliatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const content = await getAffiliatePageContent();

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
        <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {content.benefits.map((b) => (
            <li key={b.id} className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
              <h3 className="font-display text-base font-medium text-ink">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b.description}</p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-14 max-w-xl rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60 sm:p-8">
          <h2 className="font-display text-xl font-medium text-ink">{content.formHeading}</h2>
          <p className="mt-1.5 text-sm text-ink-soft">{content.formSubheading}</p>
          <form action={submitAffiliateApplicationAction} className="mt-6 space-y-4">
            <FormError message={error} />
            <FormNotice message={success ? content.successMessage : undefined} />
            {content.fields
              .filter((field) => field.visible)
              .map((field) => {
                const meta = FIELD_META[field.id];
                if (!meta) return null;
                if (meta.kind === "textarea") {
                  return (
                    <FormTextArea
                      key={field.id}
                      label={field.label}
                      name={field.id}
                      required={field.required}
                      rows={meta.rows}
                      placeholder={field.placeholder || undefined}
                    />
                  );
                }
                return (
                  <FormField
                    key={field.id}
                    label={field.label}
                    name={field.id}
                    type={meta.type}
                    required={field.required}
                    autoComplete={meta.autoComplete}
                    placeholder={field.placeholder || undefined}
                  />
                );
              })}
            <SubmitButton label={content.submitButtonLabel} />
          </form>
        </div>
      </Container>
    </>
  );
}
