import type { Metadata } from "next";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { verificationTokens } from "@/lib/db/schema";
import { AuthCard, FormField, FormError, SubmitButton } from "@/components/auth/auth-card";
import { resetPasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Set a New Password",
  robots: { index: false },
};

function isTokenExpired(expiresAt: Date | undefined): boolean {
  return !expiresAt || expiresAt.getTime() < Date.now();
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token) {
    return (
      <AuthCard title="Reset link missing" subtitle="This page needs a reset token — use the link from the previous step.">
        <FormError message="No reset token was provided." />
      </AuthCard>
    );
  }

  // Read-only lookup (never consumes the token — resetPasswordAction does
  // that) just to adapt the copy: "password_setup" is a Google-created or
  // staff-invited account setting a password for the first time, not
  // "resetting" one it never had.
  const [tokenRow] = await db
    .select({ type: verificationTokens.type, expiresAt: verificationTokens.expiresAt })
    .from(verificationTokens)
    .where(and(eq(verificationTokens.token, token), inArray(verificationTokens.type, ["password_reset", "password_setup"])));

  const isSetup = tokenRow?.type === "password_setup";
  const expired = !tokenRow || isTokenExpired(tokenRow.expiresAt);

  if (expired) {
    return (
      <AuthCard title="Link expired" subtitle="This link is no longer valid — request a new one below.">
        <FormError message="That link has expired or was already used." />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={isSetup ? "Set your password" : "Set a new password"}
      subtitle={
        isSetup
          ? "Choose a password to sign in with going forward."
          : "Choose a new password for your account."
      }
    >
      <form action={resetPasswordAction} className="space-y-4">
        <FormError message={error} />
        <input type="hidden" name="token" value={token} />
        <FormField label={isSetup ? "Password" : "New password"} name="password" type="password" autoComplete="new-password" />
        <FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" />
        <p className="text-xs text-ink-faint">Must be at least 8 characters.</p>
        <SubmitButton label={isSetup ? "Set password" : "Update password"} />
      </form>
    </AuthCard>
  );
}
