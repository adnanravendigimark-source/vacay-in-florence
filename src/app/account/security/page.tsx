import type { Metadata } from "next";
import { requireUser } from "@/lib/require-user";
import { FormField, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { changePasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Account Security",
  robots: { index: false },
};

export default async function AccountSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireUser("/account/security");
  const { error, success } = await searchParams;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
      <h1 className="font-display text-2xl font-medium text-ink">Security</h1>
      <p className="mt-1 text-sm text-ink-soft">Change your password.</p>

      <form action={changePasswordAction} className="mt-6 max-w-md space-y-4">
        <FormError message={error} />
        <FormNotice message={success ? "Password updated." : undefined} />
        <FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" />
        <FormField label="New password" name="newPassword" type="password" autoComplete="new-password" />
        <FormField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" />
        <p className="text-xs text-ink-faint">Must be at least 8 characters.</p>
        <SubmitButton label="Update password" />
      </form>
    </div>
  );
}
