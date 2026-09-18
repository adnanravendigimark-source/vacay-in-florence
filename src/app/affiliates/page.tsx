import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FormField, FormTextArea, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { submitAffiliateApplicationAction } from "./actions";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description: "Earn commission recommending Florence experiences your audience will actually enjoy.",
  alternates: { canonical: "/affiliates" },
};

const BENEFITS = [
  {
    title: "Commission on real bookings",
    description: "Earn a share of every completed booking that comes through your link — not just clicks.",
  },
  {
    title: "A catalog worth recommending",
    description: "Every experience is vetted in person, so you're never pointing your audience at something dodgy.",
  },
  {
    title: "Direct support",
    description: "A real person on our team, not a self-serve affiliate portal you never hear from again.",
  },
];

export default async function AffiliatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <>
      <div className="bg-cream-deep/40 py-14 sm:py-20">
        <Container className="max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-terracotta">Affiliate program</p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-ink sm:text-5xl">
            Recommend Florence, get paid for it
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">
            If you write about travel, run a Florence-focused audience, or work in Italian tourism, apply to promote
            our vetted experiences and earn commission on the bookings you send our way.
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
          <h2 className="font-display text-xl font-medium text-ink">Apply to the affiliate program</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            Tell us a bit about where and how you&apos;d be sharing VACAY Florence.
          </p>
          <form action={submitAffiliateApplicationAction} className="mt-6 space-y-4">
            <FormError message={error} />
            <FormNotice
              message={success ? "Application received — our partnerships team will be in touch within a few days." : undefined}
            />
            <FormField label="Your name" name="name" autoComplete="name" />
            <FormField label="Email" name="email" type="email" autoComplete="email" />
            <FormField label="Phone (optional)" name="phone" type="tel" required={false} autoComplete="tel" />
            <FormField label="Business / brand name (optional)" name="company" required={false} autoComplete="organization" />
            <FormField label="Website or main channel (optional)" name="website" type="url" required={false} placeholder="https://" />
            <FormField
              label="Audience size (optional)"
              name="audienceSize"
              required={false}
              placeholder="e.g. 12,000 newsletter subscribers"
            />
            <FormTextArea label="Anything else? (optional)" name="message" required={false} rows={3} />
            <SubmitButton label="Submit application" />
          </form>
        </div>
      </Container>
    </>
  );
}
