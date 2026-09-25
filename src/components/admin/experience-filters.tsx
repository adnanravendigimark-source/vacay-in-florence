"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "live", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending review" },
  { value: "paused", label: "Paused" },
];

const FEATURED_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "featured", label: "Featured" },
  { value: "not_featured", label: "Not featured" },
];

export function ExperienceFilters({
  categories,
  initialQuery,
  initialCategoryId,
  initialStatus,
  initialFeatured,
  view,
}: {
  categories: { id: string; name: string }[];
  initialQuery: string;
  initialCategoryId: string;
  initialStatus: string;
  initialFeatured: string;
  view: "list" | "grid";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") sp.delete(key);
        else sp.set(key, value);
      }
      // Any filter change resets pagination back to page 1.
      if (!("page" in updates)) sp.delete("page");
      router.push(`${pathname}?${sp.toString()}`);
    },
    [pathname, router, searchParams],
  );

  function handleSearchChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams({ q: value }), 400);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const selectClasses =
    "rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-700 outline-none transition focus:border-[#2b0934]/40 focus:ring-1 focus:ring-[#2b0934]/20";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1 sm:flex-none sm:w-64">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-neutral-400 stroke-2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search experiences…"
          className="w-full rounded-xl border border-[#EAE6DF] bg-white py-2.5 pl-9 pr-3.5 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#2b0934]/40 focus:ring-1 focus:ring-[#2b0934]/20"
        />
      </div>

      <select
        value={initialCategoryId}
        onChange={(e) => updateParams({ category: e.target.value })}
        className={selectClasses}
      >
        <option value="all">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={initialStatus}
        onChange={(e) => updateParams({ status: e.target.value })}
        className={selectClasses}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={initialFeatured}
        onChange={(e) => updateParams({ featured: e.target.value })}
        className={selectClasses}
      >
        {FEATURED_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-1 rounded-xl border border-[#EAE6DF] bg-white p-1">
        <button
          type="button"
          onClick={() => updateParams({ view: "list" })}
          aria-label="List view"
          aria-pressed={view === "list"}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
            view === "list" ? "bg-[#2b0934] text-white" : "text-neutral-400 hover:bg-[#FAF8F5]"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => updateParams({ view: "grid" })}
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
            view === "grid" ? "bg-[#2b0934] text-white" : "text-neutral-400 hover:bg-[#FAF8F5]"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
