"use client";

import { useState } from "react";
import Link from "next/link";
import { FormField, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { resendVerificationEmailAction } from "./actions";

export function ResendVerificationForm() {
  const [sent, setSent] = useState(false);
  const [fallbackLink, setFallbackLink] = useState<string | undefined>(undefined);

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const result = await resendVerificationEmailAction(email);
    setFallbackLink(result.verificationLink);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <FormNotice message="If that email has a pending account, a new verification link is on its way." />
        {fallbackLink && (
          <Link
            href={fallbackLink}
            className="block w-full rounded-full bg-cypress px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-cypress/90"
          >
            Continue to verify your email
          </Link>
        )}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormField label="Email" name="email" type="email" autoComplete="email" />
      <SubmitButton label="Send a new link" />
    </form>
  );
}
