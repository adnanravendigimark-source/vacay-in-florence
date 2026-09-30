import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles, suppliers, verificationTokens } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validation/auth";
import { mergeGuestCartIntoUser } from "@/lib/cart";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendGoogleWelcomeEmail } from "@/lib/email";

const PASSWORD_SETUP_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * NextAuth v5, Credentials + Google providers, JWT session strategy.
 *
 * Deliberately does NOT use the Drizzle/Prisma adapter (which would need
 * Account/Session/VerificationToken tables shaped to NextAuth's schema).
 * `authorize()` queries the app's own `users` table directly and returns
 * a plain user object; the JWT callback carries the user id forward into
 * the session. This keeps auth to a single table plus the app's own
 * `verification_tokens` table (email verification, password reset, and
 * password setup — see schema.ts's comment on that table). The Google
 * provider follows the same rule: no separate `accounts` table to record
 * the OAuth link — the `signIn` callback below finds-or-creates a plain
 * `users` row by email and that row *is* the account, exactly like a
 * password signup.
 *
 * Full account isolation across the three login surfaces: `users.email`
 * is unique only *per* `accountType` ("customer" | "staff" | "supplier"),
 * not globally (see schema.ts's users table comment and the
 * users_email_account_type_idx index) — so the same email address can
 * hold up to three completely independent accounts, each with its own
 * password, verification state, and session. There is deliberately no
 * cross-referencing between them anywhere in this file: every lookup
 * below is scoped to one specific accountType, which is what makes
 * "admin email tried on customer login" behave as a plain, honest
 * account-not-found rather than a special case to detect.
 *
 * Three Credentials providers cover the three separate login surfaces:
 *  - "credentials" (id omitted -> defaults to "credentials"): the public
 *    /login form. Looks up only accountType "customer" — a staff or
 *    supplier row with the same email is simply a different row this
 *    query never sees, so it can never authenticate here no matter what.
 *  - "admin-credentials": the /admin/login form. Looks up only
 *    accountType "staff", and additionally requires roleId to still be
 *    set — a revoked staff account (see removeStaffAccess) keeps its row
 *    forever (so the email stays reserved in the staff context and
 *    audit_logs' actorUserId FK never dangles) but can never sign in
 *    again once roleId is cleared.
 *  - "supplier-credentials": the /supplier/login form (authorizeSupplier,
 *    below authorizeAgainstRole). Looks up only accountType "supplier".
 *    Only succeeds for an *approved* supplier; a pending/rejected/
 *    suspended supplier's correct password still never returns a session
 *    here (approval is enforced at the auth boundary, not just hidden in
 *    the UI) — the login page does its own separate, non-auth status
 *    lookup so those suppliers see the real reason instead of a bare
 *    "invalid credentials" (src/app/supplier/login/actions.ts).
 * Doing this rejection inside authorize() (one request) means an
 * unauthenticated snooper can't tell "wrong password" apart from "right
 * password, wrong surface" — both come back as one generic
 * authentication failure, which is the safer default.
 *
 * All three Credentials providers also require `emailVerified` to be
 * set before returning a session — a password account can't sign in at
 * all until its emailed verification link has been used (or, for a
 * customer account specifically, until a matching Google sign-in has
 * verified it instead — see the signIn callback below).
 *
 * All three Credentials providers, plus the Google provider below, are
 * gated on a Google reCAPTCHA v2 ("I'm not a robot" checkbox) token —
 * every login/register form on the site renders the checkbox (see
 * src/components/auth/recaptcha-checkbox.tsx) and passes its token
 * through as `recaptchaToken`; verification happens here, server-side,
 * before any password check or DB write, via src/lib/recaptcha.ts.
 */
async function authorizeAgainstRole(rawCredentials: unknown, requireStaff: boolean) {
  const candidate = (rawCredentials ?? {}) as Record<string, unknown>;

  const recaptchaOk = await verifyRecaptcha(candidate.recaptchaToken as string | undefined);
  if (!recaptchaOk) return null;

  const parsed = loginSchema.safeParse(rawCredentials);
  if (!parsed.success) return null;
  const { email, password } = parsed.data;

  const accountType = requireStaff ? "staff" : "customer";
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase()), eq(users.accountType, accountType)));
  if (!user) return null;

  // Revoked staff access (roleId cleared, row kept — see
  // removeStaffAccess) must never authenticate, same as no row at all.
  if (requireStaff && !user.roleId) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  if (!user.emailVerified) return null;

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
  const candidate = (rawCredentials ?? {}) as Record<string, unknown>;

  const recaptchaOk = await verifyRecaptcha(candidate.recaptchaToken as string | undefined);
  if (!recaptchaOk) return null;

  const parsed = loginSchema.safeParse(rawCredentials);
  if (!parsed.success) return null;
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase()), eq(users.accountType, "supplier")));
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  if (!user.emailVerified) return null;

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

// Minimal shape of the fields Google's OpenID profile actually returns
// that the signIn callback below needs — next-auth's own `Profile` type
// is provider-agnostic and doesn't declare these.
interface GoogleProfile {
  email?: string;
  email_verified?: boolean;
  name?: string;
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
        recaptchaToken: { label: "reCAPTCHA", type: "text" },
      },
      authorize: (rawCredentials) => authorizeAgainstRole(rawCredentials, false),
    }),
    Credentials({
      id: "admin-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        recaptchaToken: { label: "reCAPTCHA", type: "text" },
      },
      authorize: (rawCredentials) => authorizeAgainstRole(rawCredentials, true),
    }),
    Credentials({
      id: "supplier-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        recaptchaToken: { label: "reCAPTCHA", type: "text" },
      },
      authorize: (rawCredentials) => authorizeSupplier(rawCredentials),
    }),
    // Public-website sign-in only — always operates on accountType
    // "customer" exclusively (see the signIn callback below), never
    // staff, never supplier. Not rendered anywhere on /admin/login or
    // /supplier/login.
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const googleProfile = profile as GoogleProfile | undefined;
        const email = (googleProfile?.email ?? user.email ?? "").trim().toLowerCase();
        if (!email) return false;
        // Google marks an address unverified only in rare edge cases
        // (e.g. some Workspace configurations) — refuse rather than
        // auto-link an account on an unverified address.
        if (googleProfile?.email_verified === false) return false;

        // Scoped to accountType "customer" specifically — a staff or
        // supplier row sharing this email is a different row entirely
        // and is never visible to Google sign-in, by construction.
        const [existing] = await db
          .select()
          .from(users)
          .where(and(eq(users.email, email), eq(users.accountType, "customer")));

        if (existing) {
          // Google's own verified-email claim is treated as equally
          // strong proof of ownership as clicking the emailed
          // verification link — so a password signup that hasn't been
          // verified yet gets auto-verified and linked here, rather
          // than blocked pending that separate email.
          if (!existing.emailVerified) {
            await db
              .update(users)
              .set({ emailVerified: new Date(), updatedAt: new Date() })
              .where(eq(users.id, existing.id));
          }

          user.id = existing.id;
          user.name = existing.name;
          user.roleId = null;
          user.roleName = null;
        } else {
          // First time this email has signed in as a customer — create
          // a real customer account for it, same as registering with a
          // password would. passwordHash is NOT NULL in the schema
          // (every account has a real bcrypt hash today), so a
          // Google-only account gets a random, unusable one: nobody
          // knows it and it can never match a typed password, so a
          // password-login attempt for this email still correctly
          // fails until the person sets a real password via the
          // welcome email below (or "forgot password").
          const unusablePassword = crypto.randomBytes(32).toString("hex");
          const passwordHash = await bcrypt.hash(unusablePassword, 12);
          const name = googleProfile?.name?.trim() || user.name || email.split("@")[0];

          const [created] = await db
            .insert(users)
            .values({
              email,
              name,
              passwordHash,
              accountType: "customer",
              // Google already verified this address on its end.
              emailVerified: new Date(),
            })
            .returning({ id: users.id });

          user.id = created.id;
          user.name = name;
          user.roleId = null;
          user.roleName = null;

          // Welcome email + password-setup link, best-effort — never
          // blocks the sign-in itself over an email provider hiccup.
          const token = crypto.randomUUID();
          await db.insert(verificationTokens).values({
            userId: created.id,
            token,
            type: "password_setup",
            expiresAt: new Date(Date.now() + PASSWORD_SETUP_TTL_MS),
          });
          sendGoogleWelcomeEmail(email, name, token).catch((error) => {
            console.error("signIn(google): welcome email failed:", error);
          });
        }
      }

      // Folds any guest-cart items on this browser into the account
      // that just signed in. Best-effort (see mergeGuestCartIntoUser) —
      // never blocks a real login over a cart-merge hiccup. Runs for
      // every provider uniformly rather than special-casing one.
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
