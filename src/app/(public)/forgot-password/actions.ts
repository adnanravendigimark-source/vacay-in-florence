"use server";

import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * This page is shared by the customer (/login) and supplier
 * (/supplier/login) sign-in surfaces — admin has no forgot-password link
 * today. Under the account-isolation model the same email can hold a
 * separate row per accountType, so the caller tells us which one via a
 * hidden `role` field (set from the `?role=` query param each login
 * surface's "Forgot password?" link carries) — never trust email alone
 * to pick a single row.
 *
 * Sends the real reset email via Resend; since the shared onboarding@
 * resend.dev sender only reliably reaches the Resend account owner's own
 * inbox until a domain is verified, this still returns the raw link as
 * an honest fallback when the send didn't succeed (this project's
 * established "never fake a success state" convention).
 */
export async function forgotPasswordAction(formData: FormData): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  const roleRaw = String(formData.get("role") ?? "customer");
  const accountType = roleRaw === "supplier" ? "supplier" : roleRaw === "staff" ? "staff" : "customer";

  if (!parsed.success) {
    redirect(`/forgot-password?role=${accountType}&error=${encodeURIComponent("Enter a valid email address.")}`);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, parsed.data.email), eq(users.accountType, accountType)));

  if (!user) {
    redirect(`/forgot-password?role=${accountType}&error=${encodeURIComponent("No account found with that email.")}`);
  }

  const token = crypto.randomUUID();
  await db.insert(verificationTokens).values({
    userId: user.id,
    token,
    type: "password_reset",
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  const sendResult = await sendPasswordResetEmail(user.email, user.name, token);
  const linkParam = sendResult.ok ? "" : `&link=${encodeURIComponent(`/reset-password?token=${token}`)}`;
  redirect(`/forgot-password?role=${accountType}&sent=1${linkParam}`);
}
