"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormField, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { RecaptchaCheckbox, type RecaptchaCheckboxHandle } from "@/components/auth/recaptcha-checkbox";
import { loginSchema } from "@/lib/validation/auth";
import { checkCustomerLoginStatusAction } from "./actions";

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
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaCheckboxHandle>(null);

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

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    // Non-auth pre-check so a staff or supplier account on this same
    // email (or no account at all) gets a clear "Account not found"
    // here, distinct from a customer account with the wrong password —
    // per the isolation model, this surface only ever recognizes a
    // "customer" accountType row. Never used to authorize anything: the
    // "credentials" NextAuth provider below independently re-verifies
    // accountType/emailVerified itself regardless of what this reports.
    const status = await checkCustomerLoginStatusAction(parsed.data.email);
    if (!status.found) {
      setError("We couldn't find a customer account with that email. You can create one below.");
      return;
    }
    if (status.emailVerified === false) {
      setError("Please confirm your email address before signing in — check your inbox for the link we sent.");
      return;
    }

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      recaptchaToken,
      redirect: false,
    });

    if (result?.error) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
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
          href="/forgot-password?role=customer"
          className="font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <div className="pt-1">
        <RecaptchaCheckbox ref={recaptchaRef} onChange={setRecaptchaToken} />
      </div>

      <div className="pt-2">
        <SubmitButton label="Sign in" disabled={!recaptchaToken} />
      </div>
    </form>
  );
}
