import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, FormField, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { loginAction } from "./actions";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your VACAY Florence account to access priority tickets, itineraries, and vouchers.",
  robots: { index: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "That email or password doesn't match an account.",
  validation: "Enter a valid email address and password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string; reset?: string }>;
}) {
  const { error, redirectTo, reset } = await searchParams;

  return (
    <AuthCard
      activeTab="login"
      title="Welcome back"
      subtitle="Sign in to your account"
    >
      <form action={loginAction} className="space-y-4">
        <FormError message={error ? ERROR_MESSAGES[error] : undefined} />
        <FormNotice message={reset ? "Password updated — sign in with your new password." : undefined} />
        <input type="hidden" name="redirectTo" value={redirectTo ?? "/account"} />
        
        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="your.email@example.com"
        />
        
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-neutral-600 cursor-pointer select-none">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 accent-neutral-900"
            />
            <span>Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <SubmitButton label="Sign in" />
        </div>
      </form>
    </AuthCard>
  );
}
