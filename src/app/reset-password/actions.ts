"use server";

import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { resetPasswordSchema } from "@/lib/validation/auth";

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

  const tokenRow = db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.token, parsed.data.token), eq(verificationTokens.type, "password_reset")))
    .get();

  if (!tokenRow || tokenRow.expiresAt.getTime() < Date.now()) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("That reset link has expired. Request a new one below.")}`,
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, tokenRow.userId)).run();
  // Single-use token.
  db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRow.id)).run();

  redirect("/login?reset=1");
}
