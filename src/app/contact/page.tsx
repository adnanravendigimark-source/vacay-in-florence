import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FormField, FormTextArea, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { submitContactAction } from "./actions";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the VACAY Florence team — booking questions, changes, or anything else.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className="bg-cream-deep/40 py-14 sm:py-20">
      <Container className="max-w-xl">
        <div className="text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-terracotta">Contact</p>
          <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Get in touch</h1>
          <p className="mx-auto mt-3 max-w-md text-base text-ink-soft">
            Questions about a booking, a listing, or anything else — a real person on our Florence team reads every
            message.
          </p>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60 sm:p-8">
          <form action={submitContactAction} className="space-y-4">
            <FormError message={error} />
            <FormNotice message={success ? "Thanks — we'll get back to you within a couple of business days." : undefined} />
            <FormField label="Name" name="name" autoComplete="name" />
            <FormField label="Email" name="email" type="email" autoComplete="email" />
            <FormField label="Phone (optional)" name="phone" type="tel" required={false} autoComplete="tel" />
            <FormTextArea label="Message" name="message" placeholder="How can we help?" />
            <SubmitButton label="Send message" />
          </form>
        </div>
      </Container>
    </div>
  );
}
