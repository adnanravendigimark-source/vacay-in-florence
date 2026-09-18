import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Server-side auth guard for account/checkout pages. Redirects to
 * /login with a `redirectTo` back to the page the visitor wanted, so
 * they land where they meant to go right after signing in.
 */
export async function requireUser(currentPath: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
  }
  return session.user;
}
