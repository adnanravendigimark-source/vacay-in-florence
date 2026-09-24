"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Field, Input, Button } from "@/components/admin/ui";
import { loginSchema } from "@/lib/validation/auth";

/**
 * Client-side admin sign-in form. Uses the "admin-credentials" NextAuth
 * provider (see src/lib/auth.ts), which rejects a non-staff account's
 * credentials server-side in the same request rather than this form
 * having to sign in first and check the role afterward — that earlier
 * two-round-trip version (signIn -> getSession -> signOut-if-wrong) was
 * what made this form feel slow. One request now covers it.
 *
 * Uses next-auth/react's client signIn() (not the server-side signIn
 * behind a Server Action) so next-auth's SessionProvider — which powers
 * useSession() in SiteHeader/AdminNav — is notified of the new session
 * immediately, same reasoning as the public login-form.tsx.
 */
export function AdminLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

    setPending(true);

    const result = await signIn("admin-credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      setPending(false);
      setError("That email or password doesn't match an admin account.");
      return;
    }

    router.refresh();
    router.push(redirectTo);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Field label="Email address" required>
        <Input name="email" type="email" autoComplete="email" placeholder="you@vacayinflorence.com" required />
      </Field>

      <Field label="Password" required>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />
      </Field>

      <Button type="submit" variant="primary" className="w-full justify-center" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
