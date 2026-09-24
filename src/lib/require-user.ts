import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, roles, rolePermissions, permissions } from "@/lib/db/schema";

/**
 * Server-side auth guard for account/checkout pages. Redirects to
 * /login with a `redirectTo` back to the page the visitor wanted, so
 * they land where they meant to go right after signing in.
 */
export async function requireUser(currentPath: string) {
  const session = await auth();
  if (session?.user?.id) {
    return session.user;
  }
  // In development, fallback to the primary test account so account pages are directly viewable
  if (process.env.NODE_ENV === "development") {
    return {
      id: "d6b99e2c-63fc-42cd-854b-cf6dd7b59238",
      name: "Adnan Khan",
      email: "adnanravendigimark@gmail.com",
    };
  }
  redirect(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
}

export type StaffContext = {
  userId: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  permissionKeys: Set<string>;
};

/**
 * Fresh per-request lookup of the signed-in user's staff role and
 * resolved permission set, joined straight from `role_permissions` ->
 * `permissions` on every call. Wrapped in React's `cache()` so every
 * requireAdmin/requirePermission call within one request/page render
 * shares a single pair of DB round trips — but nothing here is cached
 * *across* requests or trusted from the session JWT: a permission
 * granted or revoked on a role takes effect for that role's members on
 * their very next request, matching the platform blueprint's "never
 * trusted from the client, checked at the API/query layer on every
 * request" rule. Returns null for a logged-out visitor or an ordinary
 * customer (users.roleId is null).
 */
export const getStaffContext = cache(async (): Promise<StaffContext | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [row] = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      roleId: roles.id,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, session.user.id));

  if (!row) return null;

  const permRows = await db
    .select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, row.roleId));

  return {
    ...row,
    permissionKeys: new Set(permRows.map((p) => p.key)),
  };
});

/**
 * Gate for every /admin/* route. Admin has its own sign-in surface at
 * /admin/login (deliberately separate from the customer-facing
 * /login — see that page and the public login-form.tsx's matching
 * guard). Both a logged-out visitor AND a logged-in customer with no
 * staff role are sent to /admin/login, not to "/" — the earlier
 * version sent non-staff sessions home instead, which meant a visitor
 * whose *current* session wasn't staff could never even reach the
 * admin sign-in form to try different credentials (it just bounced
 * them back to the public site). admin/login/page.tsx already handles
 * this safely: it only auto-redirects *staff* sessions straight
 * through, so a non-staff visitor lands on the real login form and can
 * sign in with an admin account from there.
 */
export async function requireAdmin(currentPath: string): Promise<StaffContext> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/admin/login?redirectTo=${encodeURIComponent(currentPath)}`);
  }
  const staff = await getStaffContext();
  if (!staff) {
    redirect(`/admin/login?redirectTo=${encodeURIComponent(currentPath)}`);
  }
  return staff;
}

/**
 * Gate for one specific admin capability. Layers on top of
 * requireAdmin (so it also handles the logged-out/non-staff cases),
 * then checks the *live* permission set — see getStaffContext above.
 * A staff member whose role lacks this permission is redirected back
 * to the admin dashboard with an error flag the shell can surface as a
 * banner, rather than silently 404ing.
 */
export async function requirePermission(key: string, currentPath: string): Promise<StaffContext> {
  const staff = await requireAdmin(currentPath);
  if (!staff.permissionKeys.has(key)) {
    redirect("/admin?error=forbidden");
  }
  return staff;
}
