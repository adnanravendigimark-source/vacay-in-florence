import "server-only";
import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export interface AccountLoginStatus {
  found: boolean;
  emailVerified?: boolean;
}

/**
 * Non-auth "is there an account here" prechecks for the customer
 * (/login) and admin (/admin/login) surfaces, mirroring the supplier
 * precheck that already existed (getSupplierLoginStatus in
 * src/lib/data/supplier/registration.ts). Used only to pick which
 * message a login form shows — "Account not found" vs "confirm your
 * email" vs a generic wrong-password error — never to authorize
 * anything: the real "credentials"/"admin-credentials" NextAuth
 * providers (src/lib/auth.ts) independently re-verify accountType,
 * roleId, and emailVerified themselves and are the only things that can
 * ever return a session.
 *
 * Under the account-isolation model (accountType + email is the unique
 * key on `users`, not email alone), the same email can have a separate
 * row per role. So "found" here deliberately answers "is there a
 * <this-surface's-accountType> account for this email", not "does this
 * email exist anywhere" — an admin email trying the customer surface,
 * or a supplier email trying the customer surface, correctly comes back
 * `found: false` even though a row for that email exists under a
 * different accountType.
 */

export async function getCustomerLoginStatus(email: string): Promise<AccountLoginStatus> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { found: false };

  const [row] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(and(eq(users.email, normalized), eq(users.accountType, "customer")));

  if (!row) return { found: false };
  return { found: true, emailVerified: Boolean(row.emailVerified) };
}

/**
 * A revoked staff row (roleId cleared by removeStaffAccess, accountType
 * kept as "staff" forever) is treated identically to "no account" here —
 * matches authorizeAgainstRole's own `if (requireStaff && !user.roleId)
 * return null` gate in src/lib/auth.ts.
 */
export async function getAdminLoginStatus(email: string): Promise<AccountLoginStatus> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { found: false };

  const [row] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(and(eq(users.email, normalized), eq(users.accountType, "staff"), isNotNull(users.roleId)));

  if (!row) return { found: false };
  return { found: true, emailVerified: Boolean(row.emailVerified) };
}
