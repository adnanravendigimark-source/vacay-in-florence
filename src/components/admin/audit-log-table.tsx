"use client";

import { useMemo, useState } from "react";
import type { AdminAuditLogRow } from "@/lib/data/admin/audit-log";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function summarize(value: unknown): string | null {
  if (value == null) return null;
  try {
    const s = JSON.stringify(value);
    return s.length > 120 ? `${s.slice(0, 120)}…` : s;
  } catch {
    return null;
  }
}

export function AuditLogTable({ rows }: { rows: AdminAuditLogRow[] }) {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  const entityTypes = useMemo(() => Array.from(new Set(rows.map((r) => r.entityType))).sort(), [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (entityFilter !== "all" && r.entityType !== entityFilter) return false;
      if (!term) return true;
      return (
        r.action.toLowerCase().includes(term) ||
        (r.actorName ?? "").toLowerCase().includes(term) ||
        (r.actorEmail ?? "").toLowerCase().includes(term) ||
        (r.entityId ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, search, entityFilter]);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-700">No activity logged yet</p>
        <p className="mt-1 text-xs text-neutral-500">Changes made from the Admin Panel will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action, staff member, or entity id…"
          className="min-w-[240px] flex-1 rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2b0934]/20"
        />
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-xl border border-[#EAE6DF] bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm"
        >
          <option value="all">All entities</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Staff member</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-[#F5F3EF] last:border-0 hover:bg-[#FAF8F5] align-top">
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{dateFormatter.format(row.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{row.actorName ?? "Unknown"}</p>
                  {row.actorEmail ? <p className="text-[11px] text-neutral-500">{row.actorEmail}</p> : null}
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-[#F0ECE6] px-1.5 py-0.5 text-[11px] text-neutral-700">{row.action}</code>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {row.entityType}
                  {row.entityId ? <span className="block text-[11px] text-neutral-400">{row.entityId.slice(0, 12)}</span> : null}
                </td>
                <td className="max-w-xs px-4 py-3 text-[11px] text-neutral-500">
                  {summarize(row.after) ?? summarize(row.before) ?? "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  No activity matches your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
