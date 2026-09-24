import type { Metadata } from "next";
import { AuthCard, FormField, FormError, SubmitButton } from "@/components/auth/auth-card";
import { resetPasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Set a New Password",
  robots: { index: false },
};

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

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form action={resetPasswordAction} className="space-y-4">
        <FormError message={error} />
        <input type="hidden" name="token" value={token} />
        <FormField label="New password" name="password" type="password" autoComplete="new-password" />
        <FormField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" />
        <p className="text-xs text-ink-faint">Must be at least 8 characters.</p>
        <SubmitButton label="Update password" />
      </form>
    </AuthCard>
  );
}
