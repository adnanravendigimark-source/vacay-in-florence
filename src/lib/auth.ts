import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
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
 * Two Credentials providers share the lookup below:
 *  - "credentials" (id omitted -> defaults to "credentials"): the public
 *    /login form. Rejects a staff account's credentials outright — they
 *    have to use /admin/login instead — so a customer session is never
 *    silently created for a staff email typed into the wrong form.
 *  - "admin-credentials": the /admin/login form. Rejects a non-staff
 *    account's credentials the same way.
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
