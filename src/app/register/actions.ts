"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validation/auth";

export async function registerAction(formData: FormData): Promise<void> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  const { name, email, password } = parsed.data;

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    redirect(`/register?error=${encodeURIComponent("An account with that email already exists.")}&email=${encodeURIComponent(email)}`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  db.insert(users)
    .values({
      email,
      name,
      passwordHash,
    })
    .run();

  // Log the new account in immediately — this project doesn't have an
  // email provider connected (see the note in /forgot-password's
  // action), so gating first login on a verification email would mean
  // sending an email that never arrives. `users.emailVerified` stays
  // null; nothing in the app currently checks it, so this is an honest
  // simplification rather than a hidden requirement nobody can satisfy.
  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?redirectTo=${encodeURIComponent("/account")}`);
    }
    throw error;
  }
}
