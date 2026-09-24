import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, FormField, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { forgotPasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Reset Your Password",
  robots: { index: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token?: string }>;
}) {
  const { error, token } = await searchParams;

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your account email and we'll help you reset it."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-cypress hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {token ? (
        <div className="space-y-4">
          <FormNotice message="No email service is connected in this environment yet, so here's your reset link directly — in production this would arrive by email instead." />
          <Link
            href={`/reset-password?token=${token}`}
            className="block w-full rounded-full bg-cypress px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-cypress/90"
          >
            Continue to reset your password
          </Link>
        </div>
      ) : (
        <form action={forgotPasswordAction} className="space-y-4">
          <FormError message={error} />
          <FormField label="Email" name="email" type="email" autoComplete="email" />
          <SubmitButton label="Send reset instructions" />
        </form>
      )}
    </AuthCard>
  );
}
