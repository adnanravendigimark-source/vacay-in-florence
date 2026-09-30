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
  searchParams: Promise<{ error?: string; sent?: string; link?: string; role?: string }>;
}) {
  const { error, sent, link, role: roleRaw } = await searchParams;
  const role = roleRaw === "supplier" ? "supplier" : roleRaw === "staff" ? "staff" : "customer";
  const backHref = role === "supplier" ? "/supplier/login" : "/login";

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your account email and we'll help you reset it."
      footer={
        <p>
          Remembered it?{" "}
          <Link href={backHref} className="font-semibold text-cypress hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <FormNotice message="If that email has an account, we've sent a password reset link to it." />
          {link && (
            <div className="space-y-2">
              <FormNotice message="Email delivery isn't fully configured yet, so here's your reset link directly." />
              <Link
                href={link}
                className="block w-full rounded-full bg-cypress px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-cypress/90"
              >
                Continue to reset your password
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form action={forgotPasswordAction} className="space-y-4">
          <FormError message={error} />
          <input type="hidden" name="role" value={role} />
          <FormField label="Email" name="email" type="email" autoComplete="email" />
          <SubmitButton label="Send reset instructions" />
        </form>
      )}
    </AuthCard>
  );
}
