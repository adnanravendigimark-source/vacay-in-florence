import type { Metadata } from "next";
import Link from "next/link";
import { listAuditLog } from "@/lib/data/admin/audit-log";
import { requirePermission } from "@/lib/require-user";
import { AuditLogTable } from "@/components/admin/audit-log-table";

export const metadata: Metadata = {
  title: "Audit Log | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminAuditLogPage() {
  await requirePermission("auditlog.view", "/admin/audit-log");
  const rows = await listAuditLog();

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          / Audit Log
        </p>
        <div className="mt-1">
          <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">Audit Log</h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
            Every mutating change made from the Admin Panel — who did what, and when. Most recent 300 entries.
          </p>
        </div>
      </div>

      <AuditLogTable rows={rows} />
    </div>
  );
}
