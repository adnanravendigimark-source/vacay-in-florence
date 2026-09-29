import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSupplierContext } from "@/lib/require-user";
import { VacayLogo } from "@/components/ui/vacay-logo";
import { SupplierLoginForm } from "./supplier-login-form";

export const metadata: Metadata = {
  title: "Supplier Login | VACAY in Florence",
  description: "Sign in to your supplier portal to manage tours, availability, bookings, and payouts.",
  robots: { index: false, follow: false },
};

export default async function SupplierLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const target = redirectTo && redirectTo.startsWith("/supplier") ? redirectTo : "/supplier/dashboard";

  const session = await auth();
  if (session?.user?.id) {
    const supplier = await getSupplierContext();
    if (supplier?.status === "approved") {
      redirect(target);
    }
    if (supplier && supplier.status !== "approved") {
      redirect("/supplier/pending");
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans">
      {/* Left Column: Split Hero Panel (Screen 7 reference) */}
      <div className="relative w-full lg:w-1/2 min-h-[360px] lg:min-h-screen bg-[#1b3b36] overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white select-none">
        {/* Background Duomo Image */}
        <img
          src="/images/auth-florence-duomo.jpg"
          alt="Florence Cathedral and Brunelleschi dome skyline"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e211e] via-[#1b3b36]/85 to-[#1b3b36]/70" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <VacayLogo variant="light" />
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 max-w-md my-auto py-10">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3 leading-tight">
            Supplier Login
          </h1>
          <p className="text-base sm:text-lg text-emerald-100/90 font-light leading-relaxed">
            Access your supplier dashboard and manage your experiences.
          </p>

          <div className="mt-8 pt-8 border-t border-white/10 hidden sm:block">
            <div className="flex items-center gap-3 text-xs text-emerald-200/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant confirmation &amp; verified live availability sync</span>
            </div>
          </div>
        </div>

        {/* Bottom Back Affordance */}
        <div className="relative z-10 text-xs text-emerald-200/70 flex items-center justify-between">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Back to Florence site
          </Link>
          <span>VACAY Partner Network</span>
        </div>
      </div>

      {/* Right Column: Login Card & Form Console */}
      <div className="w-full lg:w-1/2 flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Top Brand */}
          <div className="mb-6 flex lg:hidden items-center justify-between">
            <VacayLogo variant="dark" />
            <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-900">
              &larr; Home
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-[#1b3b36] tracking-tight">
              Supplier Login
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Access your supplier dashboard and manage your experiences.
            </p>
          </div>

          <SupplierLoginForm redirectTo={target} />
        </div>
      </div>
    </div>
  );
}
