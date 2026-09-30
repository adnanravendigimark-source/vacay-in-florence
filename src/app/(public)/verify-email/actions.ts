"use server";

import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { sendEmailVerificationEmail } from "@/lib/email";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Re-sends a fresh email-verification link for an unverified customer
 * account (used from the "that link expired" state on this page).
 * Always returns the same generic confirmation regardless of whether an
 * account exists for that email, or is already verified — same
 * no-enumeration shape as forgot-password's action.
 */
export async function resendVerificationEmailAction(
  email: string,
): Promise<{ verificationLink?: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return {};

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, normalized), eq(users.accountType, "customer")));

  if (!user || user.emailVerified) return {};

  const token = crypto.randomUUID();
  await db.insert(verificationTokens).values({
    userId: user.id,
    token,
    type: "email_verification",
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  });

  const result = await sendEmailVerificationEmail(user.email, user.name, token);
  return { verificationLink: result.ok ? undefined : `/verify-email?token=${token}` };
}
