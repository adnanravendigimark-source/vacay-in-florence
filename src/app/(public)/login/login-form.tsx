"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormField, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { loginSchema } from "@/lib/validation/auth";

/**
 * Client-side login form.
 *
 * This calls next-auth/react's client `signIn()` (not the server-side
 * `signIn` behind a Server Action) so that next-auth's SessionProvider —
 * which powers `useSession()` in SiteHeader — is notified of the new
 * session immediately, the same way the header's own AuthModal already
 * does it (see auth-modal.tsx's handleLoginSubmit). The previous version
 * of this form posted to a Server Action; that correctly set the auth
 * cookie, but never told the client-side SessionProvider a login had
 * happened, so the header kept showing "signed out" (and clicking the
 * account icon reopened the login prompt) until a hard refresh.
 */
export function LoginForm({
  redirectTo,
  resetNotice,
}: {
  redirectTo: string;
  resetNotice?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address and password.");
      return;
    }

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      // Covers both a wrong password and a staff account's credentials
      // (this is the customer-facing login — staff sign in separately
      // at /admin/login, see admin-login-form.tsx). The "credentials"
      // NextAuth provider (src/lib/auth.ts) rejects a staff account's
      // login server-side in this same request, so there's no second
      // round trip here to tell the two cases apart — which also means
      // a wrong guess can't be used to probe whether an email belongs
      // to a staff account.
      setError("That email or password doesn't match an account.");
      return;
    }

    // Refreshes server-rendered data on the current route tree and syncs
    // useSession() across the app (header included), then takes the
    // visitor back to whatever page sent them to /login.
    router.refresh();
    router.push(redirectTo);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormError message={error ?? undefined} />
      <FormNotice message={resetNotice} />

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
  );
}
