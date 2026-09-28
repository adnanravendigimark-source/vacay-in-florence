"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SeoAuditRow, SeoEntityType } from "@/lib/data/admin/seo";

const ENTITY_LABEL: Record<SeoEntityType, string> = {
  experience: "Experience",
  category: "Category",
  blog_post: "Blog post",
};

export function SeoAuditTable({ rows }: { rows: SeoAuditRow[] }) {
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyMissing && r.hasMetaTitle && r.hasMetaDescription) return false;
      if (!term) return true;
      return r.title.toLowerCase().includes(term) || r.slug.toLowerCase().includes(term);
    });
  }, [rows, search, onlyMissing]);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-700">Nothing to audit yet</p>
        <p className="mt-1 text-xs text-neutral-500">Add an experience, category, or blog post to see its SEO status here.</p>
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
          placeholder="Search by title or slug…"
          className="min-w-[240px] flex-1 rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2b0934]/20"
        />
        <label className="flex items-center gap-2 rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs font-medium text-neutral-700">
          <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
          Only show incomplete
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Meta title</th>
              <th className="px-4 py-3">Meta description</th>
              <th className="px-4 py-3">Indexing</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={`${row.entityType}-${row.id}`} className="border-b border-[#F5F3EF] last:border-0 hover:bg-[#FAF8F5]">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{row.title}</p>
                  <p className="text-[11px] text-neutral-500">{row.publicPath}</p>
                </td>
                <td className="px-4 py-3 text-neutral-600">{ENTITY_LABEL[row.entityType]}</td>
                <td className="px-4 py-3">
                  {row.hasMetaTitle ? (
                    <span className="text-emerald-600">✓ Set</span>
                  ) : (
                    <span className="text-[#D94F3D]">Missing</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.hasMetaDescription ? (
                    <span className="text-emerald-600">✓ Set</span>
                  ) : (
                    <span className="text-[#D94F3D]">Missing</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600">{row.noIndex ? "Hidden (noindex)" : "Indexed"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={row.editHref} className="text-[11px] font-semibold text-[#2b0934] hover:underline">
                    Edit SEO
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nothing matches your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
