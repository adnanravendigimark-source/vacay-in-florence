"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const redirectTo = String(formData.get("redirectTo") || "/account");

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(`/login?error=validation&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  try {
    // On success this throws a NEXT_REDIRECT internally and never
    // returns — the guest-cart merge for a successful login happens in
    // the `signIn` callback in src/lib/auth.ts, not here, since this
    // code path doesn't run again after that redirect fires.
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=invalid&redirectTo=${encodeURIComponent(redirectTo)}`);
    }
    throw error;
  }
}
