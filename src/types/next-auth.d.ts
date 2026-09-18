import type { DefaultSession } from "next-auth";

// Extends the default NextAuth session shape with the user's database id,
// which the jwt/session callbacks in src/lib/auth.ts populate.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
