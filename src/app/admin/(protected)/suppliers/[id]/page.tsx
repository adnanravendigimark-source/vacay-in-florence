import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSupplierById } from "@/lib/data/admin/suppliers";
import { requirePermission } from "@/lib/require-user";
import { SupplierEditor } from "@/components/admin/supplier-editor";

export const metadata: Metadata = {
  title: "Supplier | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminSupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("suppliers.view", `/admin/suppliers/${id}`);
  const supplier = await getAdminSupplierById(id);
  if (!supplier) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link href="/admin/suppliers" className="hover:text-[#2b0934]">
            Suppliers
          </Link>{" "}
          / {supplier.name}
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
          {supplier.name}
        </h1>
      </div>
      <SupplierEditor supplier={supplier} />
    </div>
  );
}
