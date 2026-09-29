import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSupplierContext } from "@/lib/require-user";
import { SupplierRegisterFlow } from "./supplier-register-flow";

export const metadata: Metadata = {
  title: "Become a Supplier | VACAY in Florence",
  description: "Apply to list your tours, museum admissions, and experiences on VACAY in Florence.",
  robots: { index: false, follow: false },
};

export default async function SupplierRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;

  const session = await auth();
  if (session?.user?.id) {
    const supplier = await getSupplierContext();
    if (supplier) {
      redirect(supplier.status === "approved" ? "/supplier/dashboard" : "/supplier/pending");
    }
  }

  return <SupplierRegisterFlow initialEmail={email} initialError={error} />;
}

