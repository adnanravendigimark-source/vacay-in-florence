import type { Metadata } from "next";
import Link from "next/link";
import { listSeoAudit } from "@/lib/data/admin/seo";
import { requirePermission } from "@/lib/require-user";
import { SeoAuditTable } from "@/components/admin/seo-audit-table";

export const metadata: Metadata = {
  title: "SEO Management | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminSeoPage() {
  await requirePermission("seo.view", "/admin/seo");
  const rows = await listSeoAudit();
  const missingCount = rows.filter((r) => !r.hasMetaTitle || !r.hasMetaDescription).length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          / SEO Management
        </p>
        <div className="mt-1">
          <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
            SEO Management
          </h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
            Meta title/description coverage across every Experience and Blog post. Each has its own SEO
            tab in its editor — this is where to find what still needs one.
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        {rows.length} page{rows.length === 1 ? "" : "s"} tracked
        {missingCount > 0 ? ` · ${missingCount} missing meta title or description` : " · all have meta title and description set"}
      </p>

      <SeoAuditTable rows={rows} />
    </div>
  );
}
