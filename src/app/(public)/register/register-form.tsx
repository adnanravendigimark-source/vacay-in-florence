"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FormField, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { RecaptchaCheckbox, type RecaptchaCheckboxHandle } from "@/components/auth/recaptcha-checkbox";
import { registerSchema } from "@/lib/validation/auth";

/**
 * Client-side registration form. Creates the account via the existing
 * /api/auth/register-modal route (the same one AuthModal's register view
 * uses). No auto-login anymore: the account can't sign in until its
 * emailed verification link is used (see authorizeAgainstRole in
 * src/lib/auth.ts), so this shows a "check your email" state instead —
 * including a direct fallback link if the response says the email may
 * not have been delivered (see register-modal/route.ts's doc comment).
 */
export function RegisterForm({ defaultEmail }: { defaultEmail?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaCheckboxHandle>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [fallbackLink, setFallbackLink] = useState<string | undefined>(undefined);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    const res = await fetch("/api/auth/register-modal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.data, recaptchaToken }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      setError(data.error || "Something went wrong creating your account. Please try again.");
      return;
    }

    setSubmittedEmail(parsed.data.email);
    setFallbackLink(data.verificationLink);
  }

  if (submittedEmail) {
    return (
      <div className="space-y-4">
        <FormNotice
          message={`We've sent a confirmation link to ${submittedEmail}. Confirm it to activate your account, then sign in.`}
        />
        {fallbackLink && (
          <Link
            href={fallbackLink}
            className="block w-full rounded-full bg-cypress px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-cypress/90"
          >
            Continue to confirm your email
          </Link>
        )}
        <Link href="/login" className="block text-center text-sm font-semibold text-cypress hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormError message={error ?? undefined} />

      <FormField label="Full name" name="name" autoComplete="name" placeholder="e.g. Leonardo da Vinci" />

      <FormField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={defaultEmail}
        placeholder="your.email@example.com"
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
      />

      <FormField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
      />

      <p className="text-xs text-neutral-500 leading-relaxed pt-1">
        By signing up, you agree to the{" "}
        <Link href="/terms" className="underline hover:text-neutral-900">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-neutral-900">
          Privacy Policy
        </Link>
        , including{" "}
        <Link href="/privacy" className="underline hover:text-neutral-900">
          cookie use
        </Link>
        .
      </p>

      <div className="pt-1">
        <RecaptchaCheckbox ref={recaptchaRef} onChange={setRecaptchaToken} />
      </div>

      <div className="pt-2">
        <SubmitButton label="Sign up with email" disabled={!recaptchaToken} />
      </div>
    </form>
  );
}
