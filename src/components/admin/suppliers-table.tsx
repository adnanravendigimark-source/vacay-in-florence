"use client";

import Link from "next/link";
import type { AdminSupplierListItem, SupplierStatus } from "@/lib/data/admin/suppliers";

const STATUS_STYLE: Record<SupplierStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF7E6", text: "#B47818", label: "Pending" },
  approved: { bg: "#EAF6EE", text: "#1F7A3F", label: "Approved" },
  rejected: { bg: "#FDF0ED", text: "#D94F3D", label: "Rejected" },
  suspended: { bg: "#F0ECE6", text: "#6B6B6B", label: "Suspended" },
};

function StatusBadge({ status }: { status: SupplierStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

export function SuppliersTable({ items }: { items: AdminSupplierListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-700">No suppliers yet</p>
        <p className="mt-1 text-xs text-neutral-500">Approve an application above, or they&apos;ll show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Commission override</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-b border-[#F5F3EF] last:border-0 hover:bg-[#FAF8F5]">
              <td className="px-4 py-3 font-medium text-neutral-900">{s.name}</td>
              <td className="px-4 py-3 text-neutral-600">
                {s.contactEmail ?? "—"}
                {s.contactPhone ? <span className="block text-[11px] text-neutral-400">{s.contactPhone}</span> : null}
              </td>
              <td className="px-4 py-3 text-neutral-600">{s.country ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-600">
                {s.commissionRateOverride != null ? `${s.commissionRateOverride}%` : "Default"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={s.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/suppliers/${s.id}`} className="text-[11px] font-semibold text-[#2b0934] hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
