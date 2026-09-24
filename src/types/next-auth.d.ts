import type { DefaultSession } from "next-auth";

// Extends the default NextAuth session/user shapes with the database id
// and staff role info, which the jwt/session callbacks in src/lib/auth.ts
// populate. roleId/roleName are display-only (see the note in auth.ts) —
// null for an ordinary customer, non-null for staff. Real permission
// enforcement always re-reads the DB fresh via src/lib/require-user.ts,
// never trusts these session fields.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string | null;
      roleName: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    roleId?: string | null;
    roleName?: string | null;
    image?: string | null;
  }
}
