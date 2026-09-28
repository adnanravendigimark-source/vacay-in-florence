import type { Metadata } from "next";
import Link from "next/link";
import { listAdminAffiliates, listPendingAffiliateApplications } from "@/lib/data/admin/affiliates";
import { requirePermission } from "@/lib/require-user";
import { AffiliateApplicationsQueue } from "@/components/admin/affiliate-applications-queue";
import { AffiliatesTable } from "@/components/admin/affiliates-table";

export const metadata: Metadata = {
  title: "Affiliates | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminAffiliatesPage() {
  await requirePermission("affiliates.view", "/admin/affiliates");
  const [roster, pending] = await Promise.all([listAdminAffiliates(), listPendingAffiliateApplications()]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          / Affiliates
        </p>
        <div className="mt-1">
          <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">Affiliates</h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
            Referral partners, and applications submitted through the public &quot;Become an Affiliate&quot; page.
          </p>
        </div>
      </div>

      {pending.length > 0 ? (
        <div>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Pending applications ({pending.length})
          </h2>
          <AffiliateApplicationsQueue applications={pending} />
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Roster ({roster.length})
        </h2>
        <AffiliatesTable items={roster} />
      </div>
    </div>
  );
}
