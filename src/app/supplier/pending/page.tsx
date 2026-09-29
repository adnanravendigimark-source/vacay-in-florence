import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSupplierContext } from "@/lib/require-user";
import { getSupplierLoginStatus, type SupplierAccountStatus } from "@/lib/data/supplier/registration";
import { VacayLogo } from "@/components/ui/vacay-logo";

export const metadata: Metadata = {
  title: "Application Submitted | VACAY in Florence",
  robots: { index: false, follow: false },
};

export default async function SupplierPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const session = await auth();
  let status: SupplierAccountStatus | null = null;
  let supplierName: string | null = null;

  if (session?.user?.id) {
    const supplier = await getSupplierContext();
    if (supplier) {
      status = supplier.status as SupplierAccountStatus;
      supplierName = supplier.supplierName;
    }
  } else {
    const { email } = await searchParams;
    if (email) {
      const lookup = await getSupplierLoginStatus(email);
      if (lookup.found) {
        status = lookup.status ?? null;
        supplierName = lookup.supplierName ?? null;
      }
    }
  }

  if (status === "approved") {
    redirect("/supplier/login");
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="w-full border-b border-neutral-200/80 bg-white px-6 sm:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <VacayLogo variant="dark" />
          <Link
            href="/supplier/login"
            className="text-xs sm:text-sm font-semibold text-[#1b3b36] hover:underline"
          >
            Go to Sign In &rarr;
          </Link>
        </div>
      </header>

      {/* Main Submission Card (Screen 6) */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-xl bg-white rounded-3xl border border-neutral-200/80 shadow-md p-8 sm:p-12 text-center">
          {/* Green Check Badge & Document Illustration */}
          <div className="relative mx-auto mb-6 w-28 h-28 flex items-center justify-center">
            {/* Background Sheet Illustration */}
            <div className="absolute w-20 h-24 bg-emerald-50/70 border border-emerald-200/60 rounded-xl shadow-xs rotate-[-6deg] flex flex-col p-2.5 gap-1.5 justify-center">
              <div className="w-8 h-1.5 bg-emerald-200 rounded-full" />
              <div className="w-12 h-1 bg-emerald-100 rounded-full" />
              <div className="w-10 h-1 bg-emerald-100 rounded-full" />
            </div>

            {/* Foreground Document */}
            <div className="absolute w-20 h-24 bg-white border border-neutral-200/80 rounded-xl shadow-sm rotate-[4deg] flex flex-col p-2.5 gap-1.5 justify-center">
              <div className="w-10 h-1.5 bg-neutral-200 rounded-full" />
              <div className="w-14 h-1 bg-neutral-100 rounded-full" />
              <div className="w-12 h-1 bg-neutral-100 rounded-full" />
              <div className="w-8 h-1 bg-neutral-100 rounded-full" />
            </div>

            {/* Checkmark Circle Badge */}
            <div className="relative z-10 -top-3 -right-6 h-12 w-12 rounded-full bg-[#1b3b36] text-white flex items-center justify-center shadow-lg ring-4 ring-white">
              <svg className="h-6 w-6 stroke-current stroke-3 fill-none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1b3b36] tracking-tight">
            Application Submitted!
          </h1>

          {supplierName && (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {supplierName}
            </p>
          )}

          <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
            Your supplier registration has been successfully submitted. It is now pending approval from our admin team.
          </p>

          {/* Amber Status Notice Box */}
          <div className="mt-8 rounded-2xl bg-[#fef7e6] border border-[#fde8be] p-5 text-left flex items-start gap-4">
            <div className="h-9 w-9 rounded-full bg-[#fae8c8] text-[#b47818] flex items-center justify-center shrink-0 text-base font-bold">
              ⚠️
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#8d5b0d]">
                Pending Approval
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-[#9c6a1e] leading-relaxed">
                You will be notified once your application is reviewed. This usually takes 1-2 business days.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-neutral-300 hover:bg-neutral-50 px-8 py-3 text-sm font-semibold text-neutral-800 transition-all shadow-2xs"
            >
              Back to Homepage
            </Link>
            <Link
              href="/supplier/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-8 py-3 text-sm font-semibold transition-all shadow-sm"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-neutral-400">
        VACAY in Florence Partner Network • Skip-the-line Experiences &amp; Tours
      </footer>
    </div>
  );
}
