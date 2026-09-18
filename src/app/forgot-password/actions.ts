"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { forgotPasswordSchema } from "@/lib/validation/auth";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * No email provider is connected in this project yet (no SMTP/Resend/etc.
 * credentials exist to send from), so this deliberately does NOT pretend
 * an email went out. Instead, when the account exists, the reset link is
 * handed straight back to the page and shown on screen — an honest
 * stand-in for "check your email" until a real email provider is wired
 * up, at which point this action's job is just to stop returning the
 * link and start emailing it instead; nothing else about the token flow
 * changes.
 */
export async function forgotPasswordAction(formData: FormData): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    redirect(`/forgot-password?error=${encodeURIComponent("Enter a valid email address.")}`);
  }

  const user = db.select().from(users).where(eq(users.email, parsed.data.email)).get();
  if (!user) {
    redirect(`/forgot-password?error=${encodeURIComponent("No account found with that email.")}`);
  }

  const token = crypto.randomUUID();
  db.insert(verificationTokens)
    .values({
      userId: user.id,
      token,
      type: "password_reset",
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    })
    .run();

  redirect(`/forgot-password?token=${token}`);
}
