import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/require-user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { Container } from "@/components/ui/container";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "/account";
  const sessionUser = await requireUser(pathname);

  const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.id));
  const displayName = dbUser?.name ?? sessionUser.name ?? "";
  const displayEmail = dbUser?.email ?? sessionUser.email ?? "";

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-12 border-b border-stone/70">
      <Container className="max-w-[1340px]">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Left Column: Sidebar */}
          <div className="w-full lg:w-[280px] xl:w-[290px] shrink-0 lg:sticky lg:top-24 z-10">
            <AccountSidebar
              user={{
                name: displayName,
                email: displayEmail,
                image: dbUser?.avatarUrl ?? undefined,
              }}
            />
          </div>

          {/* Right Column: Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}
