import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, FormField, FormError, SubmitButton } from "@/components/auth/auth-card";
import { registerAction } from "./actions";

export const metadata: Metadata = {
  title: "Create an Account",
  robots: { index: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save your bookings and check out faster next time."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-cypress hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form action={registerAction} className="space-y-4">
        <FormError message={error} />
        <FormField label="Full name" name="name" autoComplete="name" />
        <FormField label="Email" name="email" type="email" autoComplete="email" defaultValue={email} />
        <FormField label="Password" name="password" type="password" autoComplete="new-password" />
        <FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" />
        <p className="text-xs text-ink-faint">Must be at least 8 characters.</p>
        <SubmitButton label="Create account" />
      </form>
    </AuthCard>
  );
}
