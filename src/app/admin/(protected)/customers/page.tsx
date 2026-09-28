import type { Metadata } from "next";
import Link from "next/link";
import { listAdminCustomers } from "@/lib/data/admin/customers";
import { requirePermission } from "@/lib/require-user";
import { CustomersTable } from "@/components/admin/customers-table";

export const metadata: Metadata = {
  title: "Customers | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminCustomersPage() {
  await requirePermission("customers.view", "/admin/customers");
  const items = await listAdminCustomers();

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          / Customers
        </p>
        <div className="mt-1">
          <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">Customers</h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
            Everyone with an account on the site. Order history and support context for each customer.
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        {items.length} customer{items.length === 1 ? "" : "s"} shown (most recent 300)
      </p>

      <CustomersTable items={items} />
    </div>
  );
}
