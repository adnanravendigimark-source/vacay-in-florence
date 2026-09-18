"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Thin client boundary around NextAuth's SessionProvider. Kept as its
 * own file (rather than importing next-auth/react directly in the
 * server-rendered layout) so the rest of the tree — every static page —
 * stays untouched by it; only the header's account icon actually reads
 * the session, via useSession(), fetched client-side after hydration.
 * This deliberately trades a small client-side session fetch for
 * keeping every marketing/catalog page statically generated, rather
 * than making the whole layout dynamic just to know who's logged in.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
