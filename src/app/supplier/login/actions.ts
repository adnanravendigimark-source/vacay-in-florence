"use server";

import { getSupplierLoginStatus, type SupplierLoginStatus } from "@/lib/data/supplier/registration";

/**
 * Non-auth pre-check used only to surface the real reason a pending/
 * rejected/suspended supplier can't sign in yet (see supplier-login-form.tsx).
 * Never used to authorize anything — the "supplier-credentials" NextAuth
 * provider (src/lib/auth.ts) independently re-verifies status itself and
 * is the only thing that can ever return a session.
 */
export async function checkSupplierLoginStatusAction(email: string): Promise<SupplierLoginStatus> {
  return getSupplierLoginStatus(email);
}
