import type { Metadata } from "next";
import { listAdminSuppliers, listPendingSupplierApplications, getAdminSupplierStats } from "@/lib/data/admin/suppliers";
import { requirePermission } from "@/lib/require-user";
import { SuppliersView } from "@/components/admin/suppliers-view";

export const metadata: Metadata = {
  title: "Suppliers | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminSuppliersPage() {
  await requirePermission("suppliers.view", "/admin/suppliers");
  const [roster, pending, stats] = await Promise.all([
    listAdminSuppliers(),
    listPendingSupplierApplications(),
    getAdminSupplierStats(),
  ]);

  return (
    <SuppliersView
      initialSuppliers={roster}
      pendingApplications={pending}
      stats={stats}
    />
  );
}
