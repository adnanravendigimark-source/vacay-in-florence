import type { Metadata } from "next";
import Link from "next/link";
import { listAdminSuppliers, listPendingSupplierApplications } from "@/lib/data/admin/suppliers";
import { requirePermission } from "@/lib/require-user";
import { SupplierApplicationsQueue } from "@/components/admin/supplier-applications-queue";
import { SuppliersTable } from "@/components/admin/suppliers-table";

export const metadata: Metadata = {
  title: "Suppliers | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminSuppliersPage() {
  await requirePermission("suppliers.view", "/admin/suppliers");
  const [roster, pending] = await Promise.all([listAdminSuppliers(), listPendingSupplierApplications()]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          / Suppliers
        </p>
        <div className="mt-1">
          <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">Suppliers</h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
            Experience partners, and applications submitted through the public &quot;Become a Supplier&quot; page.
          </p>
        </div>
      </div>

      {pending.length > 0 ? (
        <div>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Pending applications ({pending.length})
          </h2>
          <SupplierApplicationsQueue applications={pending} />
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Roster ({roster.length})
        </h2>
        <SuppliersTable items={roster} />
      </div>
    </div>
  );
}
