import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FormField, FormTextArea, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { submitSupplierApplicationAction } from "./actions";

export const metadata: Metadata = {
  title: "Become a Supplier",
  description: "List your tours, tickets, or experiences on VACAY Florence — apply to become a vetted supplier.",
  alternates: { canonical: "/become-a-supplier" },
};

const BENEFITS = [
  {
    title: "Reach travelers actively booking",
    description: "Every visitor on VACAY Florence is already planning a trip — not browsing casually.",
  },
  {
    title: "No resale, no undercutting",
    description: "We work with you directly on pricing and availability — never a resale layer you don't control.",
  },
  {
    title: "A real onboarding conversation",
    description: "Every new supplier talks to a real person on our team before going live, not a self-serve form.",
  },
];

export default async function BecomeASupplierPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <>
      <div className="bg-cream-deep/40 py-14 sm:py-20">
        <Container className="max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-terracotta">For suppliers</p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-ink sm:text-5xl">
            List your experience on VACAY Florence
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">
            We work with a small number of independent Florence guides and operators — every listing is reviewed by
            our team before it goes live, not auto-published from a feed.
          </p>
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <li key={b.title} className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
              <h3 className="font-display text-base font-medium text-ink">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b.description}</p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-14 max-w-xl rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60 sm:p-8">
          <h2 className="font-display text-xl font-medium text-ink">Apply to list your experience</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            Tell us a bit about your business — we&apos;ll follow up to talk through the details.
          </p>
          <form action={submitSupplierApplicationAction} className="mt-6 space-y-4">
            <FormError message={error} />
            <FormNotice
              message={success ? "Application received — our supplier team will be in touch within a few days." : undefined}
            />
            <FormField label="Your name" name="name" autoComplete="name" />
            <FormField label="Business name" name="company" autoComplete="organization" />
            <FormField label="Email" name="email" type="email" autoComplete="email" />
            <FormField label="Phone (optional)" name="phone" type="tel" required={false} autoComplete="tel" />
            <FormField label="Website (optional)" name="website" type="url" required={false} placeholder="https://" />
            <FormTextArea
              label="What would you like to list?"
              name="experienceType"
              rows={3}
              placeholder="e.g. Small-group walking tours of the Oltrarno, 2 hours, up to 12 people"
            />
            <FormTextArea label="Anything else? (optional)" name="message" required={false} rows={3} />
            <SubmitButton label="Submit application" />
          </form>
        </div>
      </Container>
    </>
  );
}
