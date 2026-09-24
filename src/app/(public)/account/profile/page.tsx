import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/require-user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ProfileForm } from "@/components/account/profile-form";
import { updateProfileAction } from "./actions";

export const metadata: Metadata = {
  title: "Profile | VACAY Florence",
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
    <ProfileForm
      initialUser={{
        name: dbUser?.name ?? sessionUser.name ?? "",
        email: dbUser?.email ?? sessionUser.email ?? "",
        avatarUrl: dbUser?.avatarUrl ?? "",
      }}
      error={error}
      success={success}
      formAction={updateProfileAction}
    />
  );
}
