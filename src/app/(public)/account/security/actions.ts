"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireUser } from "@/lib/require-user";
import { changePasswordSchema } from "@/lib/validation/auth";

export async function changePasswordAction(formData: FormData): Promise<void> {
  const sessionUser = await requireUser("/account/security");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/account/security?error=${encodeURIComponent(message)}`);
  }

  const [user] = await db.select().from(users).where(eq(users.id, sessionUser.id));
  if (!user) redirect("/account/security?error=Account%20not%20found.");

  const currentMatches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!currentMatches) {
    redirect(`/account/security?error=${encodeURIComponent("Current password is incorrect.")}`);
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  redirect("/account/security?success=1");
}
