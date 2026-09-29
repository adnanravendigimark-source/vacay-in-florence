import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles, suppliers } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validation/auth";
import { mergeGuestCartIntoUser } from "@/lib/cart";

/**
 * NextAuth v5, Credentials provider, JWT session strategy.
 *
 * Deliberately does NOT use the Drizzle/Prisma adapter (which would need
 * Account/Session/VerificationToken tables shaped to NextAuth's schema).
 * `authorize()` queries the app's own `users` table directly and returns
 * a plain user object; the JWT callback carries the user id forward into
 * the session. This keeps auth to a single table plus the app's own
 * `verification_tokens` table (used for email verification and password
 * reset, not sessions).
 *
 * `roleId`/`roleName` are also carried onto the session below, purely so
 * the admin UI can show "Signed in as <role>" and give the nav an instant
 * filter hint without a round trip. This is NOT the enforcement path —
 * every real permission check re-reads the live role/permission rows from
 * the DB on every request via requireAdmin/requirePermission in
 * src/lib/require-user.ts, so a role edit takes effect immediately rather
 * than waiting for the next login.
 *
 * Three Credentials providers cover the three separate login surfaces:
 *  - "credentials" (id omitted -> defaults to "credentials"): the public
 *    /login form. Rejects a staff account's credentials outright — they
 *    have to use /admin/login instead — so a customer session is never
 *    silently created for a staff email typed into the wrong form. Also
 *    rejects any account linked to a supplier row (see authorizeSupplier
 *    below) — suppliers only ever get a session via /supplier/login.
 *  - "admin-credentials": the /admin/login form. Rejects a non-staff
 *    account's credentials the same way.
 *  - "supplier-credentials": the /supplier/login form (authorizeSupplier,
 *    below authorizeAgainstRole). Discriminator is a linked `suppliers`
 *    row (suppliers.userId), not roleId — a supplier account is an
 *    ordinary customer-role user (roleId: null) that also owns a
 *    suppliers row. Only succeeds for an *approved* supplier; a
 *    pending/rejected/suspended supplier's correct password still never
 *    returns a session here (approval is enforced at the auth boundary,
 *    not just hidden in the UI) — the login page does its own separate,
 *    non-auth status lookup so those suppliers see the real reason
 *    instead of a bare "invalid credentials" (src/app/supplier/login/actions.ts).
 * Doing this rejection inside authorize() (one request) replaces an
 * earlier version that signed in first and checked the role as a
 * *second* client-side round trip (getSession() + signOut() if wrong),
 * which made the admin login form visibly slower than it needed to be.
 * It also means an unauthenticated snooper can no longer tell "wrong
 * password" apart from "right password, wrong surface" — both come back
 * as one generic authentication failure, which is the safer default.
 */
async function authorizeAgainstRole(rawCredentials: unknown, requireStaff: boolean) {
  const parsed = loginSchema.safeParse(rawCredentials);
  if (!parsed.success) return null;
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  const isStaff = Boolean(user.roleId);
  if (isStaff !== requireStaff) return null;

  // A customer-provider login (requireStaff: false) must also fail for an
  // account linked to a supplier row — suppliers authenticate only through
  // authorizeSupplier/"supplier-credentials" below, never here, even
  // though roleId is null for both. Skipped on the staff path since a
  // staff account can never be supplier-linked in practice, and to avoid
  // an unnecessary query on every admin login attempt.
  if (!requireStaff) {
    const [supplierLink] = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.userId, user.id));
    if (supplierLink) return null;
  }

  let roleName: string | null = null;
  if (user.roleId) {
    const [role] = await db.select({ name: roles.name }).from(roles).where(eq(roles.id, user.roleId));
    roleName = role?.name ?? null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleName,
  };
}

async function authorizeSupplier(rawCredentials: unknown) {
  const parsed = loginSchema.safeParse(rawCredentials);
  if (!parsed.success) return null;
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  // Staff accounts never have a supplier row, but guard explicitly so a
  // staff email can never authenticate on this surface either.
  if (user.roleId) return null;

  const [supplier] = await db
    .select({ id: suppliers.id, status: suppliers.status })
    .from(suppliers)
    .where(eq(suppliers.userId, user.id));
  // Only an approved supplier gets a session — pending/rejected/suspended
  // all fail here identically (never a session), which is the real
  // server-side authorization boundary. requireSupplier() re-checks this
  // same thing fresh on every request afterward, same as staff permissions.
  if (!supplier || supplier.status !== "approved") return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: null,
    roleName: null,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: (rawCredentials) => authorizeAgainstRole(rawCredentials, false),
    }),
    Credentials({
      id: "admin-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: (rawCredentials) => authorizeAgainstRole(rawCredentials, true),
    }),
    Credentials({
      id: "supplier-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: (rawCredentials) => authorizeSupplier(rawCredentials),
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Folds any guest-cart items on this browser into the account
      // that just signed in. Best-effort (see mergeGuestCartIntoUser) —
      // never blocks a real login over a cart-merge hiccup. Staff
      // accounts won't have a guest cart to merge in practice, but this
      // runs for both providers uniformly rather than special-casing it.
      if (user?.id) {
        await mergeGuestCartIntoUser(user.id);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleId = user.roleId ?? null;
        token.roleName = user.roleName ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.roleId = (token.roleId as string | null) ?? null;
        session.user.roleName = (token.roleName as string | null) ?? null;
      }
      return session;
    },
  },
});
