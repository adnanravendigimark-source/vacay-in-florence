"use server";

import { redirect } from "next/navigation";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireUser } from "@/lib/require-user";
import { profileUpdateSchema } from "@/lib/validation/auth";

export async function updateProfileAction(formData: FormData): Promise<void> {
  const user = await requireUser("/account/profile");

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/account/profile?error=${encodeURIComponent(message)}`);
  }

  const [emailTaken] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, parsed.data.email), ne(users.id, user.id)));
  if (emailTaken) {
    redirect(`/account/profile?error=${encodeURIComponent("That email is already in use.")}`);
  }

  await db.update(users)
    .set({ name: parsed.data.name, email: parsed.data.email, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // Note: the active session's JWT still carries the old name/email until
  // the next sign-in refreshes it — acceptable for now since nothing
  // else in the app reads session.user.name/email as a source of truth
  // (every page re-reads the users table), but worth fixing with a
  // session `update()` call if this becomes user-visible friction.
  redirect("/account/profile?success=1");
}
