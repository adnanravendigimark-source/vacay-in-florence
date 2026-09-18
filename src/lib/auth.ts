import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
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
 */
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
      async authorize(rawCredentials) {
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Folds any guest-cart items on this browser into the account
      // that just signed in. Best-effort (see mergeGuestCartIntoUser) —
      // never blocks a real login over a cart-merge hiccup.
      if (user?.id) {
        await mergeGuestCartIntoUser(user.id);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
