"use server";

import { getCustomerLoginStatus, type AccountLoginStatus } from "@/lib/data/auth/login-status";

/**
 * Non-auth pre-check used only to distinguish "no customer account with
 * this email" (e.g. an admin or supplier's email tried here) and "not
 * confirmed yet" from a plain wrong-password error — see login-form.tsx.
 * Never used to authorize anything; the "credentials" NextAuth provider
 * (src/lib/auth.ts) independently re-verifies everything itself.
 */
export async function checkCustomerLoginStatusAction(email: string): Promise<AccountLoginStatus> {
  return getCustomerLoginStatus(email);
}
