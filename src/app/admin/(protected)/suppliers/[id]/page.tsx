import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSupplierFullProfile } from "@/lib/data/admin/suppliers";
import { requirePermission } from "@/lib/require-user";
import { SupplierDetailView } from "@/components/admin/supplier-detail-view";

export const metadata: Metadata = {
  title: "Supplier Details | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminSupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("suppliers.view", `/admin/suppliers/${id}`);

  const profile = await getAdminSupplierFullProfile(id);
  if (!profile) notFound();

  return <SupplierDetailView profile={profile} />;
}
