import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminAffiliateById } from "@/lib/data/admin/affiliates";
import { requirePermission } from "@/lib/require-user";
import { AffiliateEditor } from "@/components/admin/affiliate-editor";

export const metadata: Metadata = {
  title: "Affiliate | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminAffiliateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("affiliates.view", `/admin/affiliates/${id}`);
  const affiliate = await getAdminAffiliateById(id);
  if (!affiliate) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link href="/admin/affiliates" className="hover:text-[#2b0934]">
            Affiliates
          </Link>{" "}
          / {affiliate.name}
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
          {affiliate.name}
        </h1>
      </div>
      <AffiliateEditor affiliate={affiliate} />
    </div>
  );
}
