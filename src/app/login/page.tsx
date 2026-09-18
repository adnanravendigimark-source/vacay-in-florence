import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, FormField, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { loginAction } from "./actions";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "That email or password doesn't match an account.",
  validation: "Enter a valid email and password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string; reset?: string }>;
}) {
  const { error, redirectTo, reset } = await searchParams;

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your bookings and account details."
      footer={
        <p>
          New to VACAY Florence?{" "}
          <Link href="/register" className="font-semibold text-cypress hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <form action={loginAction} className="space-y-4">
        <FormError message={error ? ERROR_MESSAGES[error] : undefined} />
        <FormNotice message={reset ? "Password updated — sign in with your new password." : undefined} />
        <input type="hidden" name="redirectTo" value={redirectTo ?? "/account"} />
        <FormField label="Email" name="email" type="email" autoComplete="email" />
        <FormField label="Password" name="password" type="password" autoComplete="current-password" />
        <div className="text-right text-sm">
          <Link href="/forgot-password" className="text-ink-faint hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <SubmitButton label="Sign in" />
      </form>
    </AuthCard>
  );
}
