"use server";

import { getAdminLoginStatus, type AccountLoginStatus } from "@/lib/data/auth/login-status";

/**
 * Non-auth pre-check used only to distinguish "no staff account with
 * this email" (a customer or supplier email, or a revoked staff row)
 * and "invite not completed yet" from a plain wrong-password error —
 * see admin-login-form.tsx. Never used to authorize anything; the
 * "admin-credentials" NextAuth provider (src/lib/auth.ts) independently
 * re-verifies accountType/roleId/emailVerified itself.
 */
export async function checkAdminLoginStatusAction(email: string): Promise<AccountLoginStatus> {
  return getAdminLoginStatus(email);
}
