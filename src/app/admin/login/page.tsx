import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStaffContext } from "@/lib/require-user";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

// Deliberately separate from the public /login page — staff sign in
// here, not through the customer-facing form (see login-form.tsx's
// matching guard, which rejects a staff account and points it back to
// this page). Lives outside the src/app/admin/(protected) route group
// so it is NOT behind requireAdmin — a logged-out visitor has to be
// able to reach this page in the first place, or the redirect from
// requireAdmin below would loop forever.
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const target = redirectTo && redirectTo.startsWith("/admin") ? redirectTo : "/admin";

  // Already signed in as staff? Skip the form entirely.
  const session = await auth();
  if (session?.user?.id) {
    const staff = await getStaffContext();
    if (staff) {
      redirect(target);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cypress px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <p className="text-center font-display text-lg font-medium text-ink">VACAY Admin</p>
        <p className="mt-1 text-center text-sm text-ink-faint">
          Staff sign-in — separate from the customer account login.
        </p>
        <div className="mt-6">
          <AdminLoginForm redirectTo={target} />
        </div>
      </div>
    </div>
  );
}
