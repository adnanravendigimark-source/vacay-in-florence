import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/require-user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { FormField, FormError, FormNotice, SubmitButton } from "@/components/auth/auth-card";
import { updateProfileAction } from "./actions";

export const metadata: Metadata = {
  title: "Profile Settings",
  robots: { index: false },
};

export default async function AccountProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const sessionUser = await requireUser("/account/profile");
  const { error, success } = await searchParams;
  const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.id));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
      <h1 className="font-display text-2xl font-medium text-ink">Profile settings</h1>
      <p className="mt-1 text-sm text-ink-soft">Update your name and email address.</p>

      <form action={updateProfileAction} className="mt-6 max-w-md space-y-4">
        <FormError message={error} />
        <FormNotice message={success ? "Profile updated." : undefined} />
        <FormField label="Full name" name="name" autoComplete="name" defaultValue={dbUser?.name} />
        <FormField label="Email" name="email" type="email" autoComplete="email" defaultValue={dbUser?.email} />
        <SubmitButton label="Save changes" />
      </form>
    </div>
  );
}
