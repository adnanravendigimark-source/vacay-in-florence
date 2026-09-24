"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormField, FormError, SubmitButton } from "@/components/auth/auth-card";
import { registerSchema } from "@/lib/validation/auth";

/**
 * Client-side registration form. Creates the account via the existing
 * /api/auth/register-modal route (the same one AuthModal's register view
 * uses), then signs the new user in with next-auth/react's client
 * `signIn()` so SiteHeader's useSession() picks up the new session right
 * away — see the matching note in login-form.tsx for why this replaced
 * the old Server Action, which signed the user in server-side and left
 * the header stuck showing "signed out" until a hard refresh.
 */
export function RegisterForm({ defaultEmail }: { defaultEmail?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }

    const res = await fetch("/api/auth/register-modal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      setError(data.error || "Something went wrong creating your account. Please try again.");
      return;
    }

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      // Account was created but the auto-login hiccuped — send them to
      // the regular sign-in form rather than silently failing.
      router.push("/login?redirectTo=%2Faccount");
      return;
    }

    router.refresh();
    router.push("/account");
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormError message={error ?? undefined} />

      <FormField label="Full name" name="name" autoComplete="name" placeholder="e.g. Leonardo da Vinci" />

      <FormField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={defaultEmail}
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
  );
}
