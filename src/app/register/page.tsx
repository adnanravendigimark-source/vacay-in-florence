import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, FormField, FormError, SubmitButton } from "@/components/auth/auth-card";
import { registerAction } from "./actions";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Join VACAY Florence to book skip-the-line tickets, guided tours, and save your Florentine itineraries.",
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
      activeTab="register"
      title="Travel with us"
      subtitle="Join us today"
    >
      <form action={registerAction} className="space-y-4">
        <FormError message={error} />
        
        <FormField
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="e.g. Leonardo da Vinci"
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={email}
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

        <div className="pt-2">
          <SubmitButton label="Sign up with email" />
        </div>
      </form>
    </AuthCard>
  );
}
