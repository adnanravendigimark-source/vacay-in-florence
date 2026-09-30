"use server";

import { redirect } from "next/navigation";
import { eq, and, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { resetPasswordSchema } from "@/lib/validation/auth";

/**
 * Consumes either of two verification_tokens types with the same
 * "set/confirm a password" shape: "password_reset" (an existing user who
 * forgot their password) and "password_setup" (a Google-created or
 * staff-invited account setting a real password for the first time —
 * see src/lib/auth.ts's signIn callback and
 * src/lib/data/admin/roles.ts's assignUserRoleByEmail). Both are
 * single-use and time-boxed; the only behavioral difference is that
 * consuming a password_setup token also proves mailbox ownership for the
 * first time, so it sets emailVerified too (a password_reset token's
 * user was already verified — that's how they got a password to forget).
 */
export async function resetPasswordAction(formData: FormData): Promise<void> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  const token = String(formData.get("token") ?? "");

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`);
  }

  const [tokenRow] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, parsed.data.token),
        inArray(verificationTokens.type, ["password_reset", "password_setup"]),
      ),
    );

  if (!tokenRow || tokenRow.expiresAt.getTime() < Date.now()) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("That link has expired. Request a new one below.")}`,
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const [{ accountType }] = await db
    .select({ accountType: users.accountType })
    .from(users)
    .where(eq(users.id, tokenRow.userId));

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
      ...(tokenRow.type === "password_setup" ? { emailVerified: new Date() } : {}),
    })
    .where(eq(users.id, tokenRow.userId));
  // Single-use token.
  await db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRow.id));

  // Send the account back to its own login surface — a staff invite's
  // password_setup token belongs on /admin/login, never the customer
  // /login page, even though both surfaces share this same reset page.
  redirect(accountType === "staff" ? "/admin/login?reset=1" : "/login?reset=1");
}
