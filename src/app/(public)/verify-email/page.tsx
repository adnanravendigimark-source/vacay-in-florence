import type { Metadata } from "next";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { AuthCard, FormNotice } from "@/components/auth/auth-card";
import { ResendVerificationForm } from "./resend-verification-form";

export const metadata: Metadata = {
  title: "Verify Your Email",
  robots: { index: false },
};

type Outcome = "success" | "invalid" | "expired" | "missing";

function isTokenExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() < Date.now();
}

/**
 * Consumes an email-verification link (see sendEmailVerificationEmail /
 * register-modal's route.ts). A GET-triggered mutation is the standard
 * shape for this kind of link — the token is single-use regardless
 * (deleted immediately after either a successful verify or an expiry),
 * so re-visiting the same link a second time safely lands on "invalid"
 * rather than re-verifying anything.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let outcome: Outcome = "missing";

  if (token) {
    const [tokenRow] = await db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.token, token), eq(verificationTokens.type, "email_verification")));

    if (!tokenRow) {
      outcome = "invalid";
    } else if (isTokenExpired(tokenRow.expiresAt)) {
      outcome = "expired";
      await db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRow.id));
    } else {
      await db
        .update(users)
        .set({ emailVerified: new Date(), updatedAt: new Date() })
        .where(eq(users.id, tokenRow.userId));
      await db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRow.id));
      outcome = "success";
    }
  }

  return (
    <AuthCard
      title={
        outcome === "success"
          ? "Email confirmed"
          : outcome === "expired"
            ? "That link expired"
            : "Verification link invalid"
      }
      subtitle={
        outcome === "success"
          ? "Your account is ready to use."
          : "Let's get you a working link."
      }
      footer={
        <p>
          <Link href="/login" className="font-semibold text-cypress hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {outcome === "success" && (
        <div className="space-y-4">
          <FormNotice message="Your email address is confirmed. You can sign in now." />
          <Link
            href="/login?verified=1"
            className="block w-full rounded-full bg-cypress px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-cypress/90"
          >
            Continue to sign in
          </Link>
        </div>
      )}

      {outcome === "expired" && (
        <div className="space-y-4">
          <FormNotice message="This verification link has expired. Enter your email and we'll send a new one." />
          <ResendVerificationForm />
        </div>
      )}

      {outcome === "invalid" && (
        <div className="space-y-4">
          <FormNotice message="This verification link isn't valid — it may have already been used. Enter your email and we'll send a new one if needed." />
          <ResendVerificationForm />
        </div>
      )}

      {outcome === "missing" && (
        <div className="space-y-4">
          <FormNotice message="No verification token was provided. Enter your email and we'll send a new one if needed." />
          <ResendVerificationForm />
        </div>
      )}
    </AuthCard>
  );
}
