import Link from "next/link";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/require-user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { Container } from "@/components/ui/container";
import { SignOutButton } from "@/components/auth/sign-out-button";

const NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/bookings", label: "My Bookings" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/security", label: "Security" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Middleware (src/middleware.ts) stamps the real requested path onto
  // this header so a deep link like /account/bookings redirects back to
  // itself after login, instead of always landing on /account.
  const pathname = (await headers()).get("x-pathname") ?? "/account";
  const sessionUser = await requireUser(pathname);
  // The session JWT can lag a profile edit until the next sign-in (see
  // the note in account/profile/actions.ts) — re-read the users table
  // here so the sidebar always shows the current name/email.
  const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.id));
  const displayName = dbUser?.name ?? sessionUser.name ?? sessionUser.email;

  return (
    <div className="bg-cream-deep/40 py-10 sm:py-14">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-stone/60">
              <p className="text-sm text-ink-faint">Signed in as</p>
              <p className="mt-0.5 truncate font-medium text-ink">{displayName}</p>
              <nav aria-label="Account" className="mt-5 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-cream-deep"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-3 border-t border-stone pt-3">
                <SignOutButton />
              </div>
            </div>
          </aside>
          <div className="lg:col-span-3">{children}</div>
        </div>
      </Container>
    </div>
  );
}
