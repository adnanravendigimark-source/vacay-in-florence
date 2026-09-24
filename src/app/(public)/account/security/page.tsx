import type { Metadata } from "next";
import { requireUser } from "@/lib/require-user";
import { SecurityManager } from "@/components/account/security-manager";
import { changePasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Security Settings | VACAY Florence",
  robots: { index: false },
};

export default async function AccountSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireUser("/account/security");
  const { error, success } = await searchParams;

  return (
    <SecurityManager
      error={error}
      success={success}
      formAction={changePasswordAction}
    />
  );
}
