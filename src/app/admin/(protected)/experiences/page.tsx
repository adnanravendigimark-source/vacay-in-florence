import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { listAdminProducts, getExperienceStats, getCategoryOptions } from "@/lib/data/admin/products";
import type { ProductStatus, FeaturedFilter } from "@/lib/data/admin/products";
import { ExperienceFilters } from "@/components/admin/experience-filters";
import { ExperienceTable } from "@/components/admin/experience-table";

export const metadata: Metadata = {
  title: "Experiences | Admin | VACAY Florence",
  robots: { index: false },
};

const numberFormatter = new Intl.NumberFormat("en-US");

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const isUp = pct >= 0;
  return (
    <span className={`text-[11px] font-semibold ${isUp ? "text-emerald-600" : "text-[#D94F3D]"}`}>
      {isUp ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current stroke-current stroke-[0.5]">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  trendPct,
  icon,
}: {
  label: string;
  value: number;
  trendPct: number | null;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-[#EAE6DF] bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.02)] sm:p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#2b0934]/15 bg-[#FAF5FC] text-[#2b0934]">
        {icon}
      </div>
      <div className="mt-3.5">
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-[26px]">
            {numberFormatter.format(value)}
          </span>
          <TrendBadge pct={trendPct} />
        </div>
        <p className="mt-1 text-[10.5px] text-neutral-400">vs. previous 30 days</p>
      </div>
    </div>
  );
}

type SearchParams = {
  q?: string;
  status?: string;
  category?: string;
  featured?: string;
  page?: string;
  view?: string;
};

export default async function AdminExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = (params.status ?? "all") as ProductStatus | "all";
  const categoryId = params.category ?? "all";
  const featured = (params.featured ?? "all") as FeaturedFilter;
  const q = params.q ?? "";
  const view = params.view === "grid" ? "grid" : "list";

  const [{ items, total, totalPages }, stats, categories] = await Promise.all([
    listAdminProducts({ q, status, categoryId, featured, page, pageSize: 20 }),
    getExperienceStats(),
    getCategoryOptions(),
  ]);

  function pageHref(targetPage: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status !== "all") sp.set("status", status);
    if (categoryId !== "all") sp.set("category", categoryId);
    if (featured !== "all") sp.set("featured", featured);
    if (view !== "list") sp.set("view", view);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return `/admin/experiences${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      {/* ================================================================= */}
      {/* HEADER */}
      {/* ================================================================= */}
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Experiences
          </Link>{" "}
          / Manage Experiences
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
              Experiences
            </h1>
            <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
              Create, edit and manage all experiences on your website.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6DF] bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-[#FAF8F5]"
            >
              <span>View Public Site</span>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
            <Link
              href="/admin/experiences/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2b0934] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3d0d4a]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add New Experience</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* STAT CARDS — real counts, real "vs. previous 30 days" trend (see
          getExperienceStats in src/lib/data/admin/products.ts); a card's
          trend badge is simply omitted when there's no prior-period data
          to compare against, same honesty rule as the main dashboard. */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Total Experiences" value={stats.total.value} trendPct={stats.total.trendPct} icon={<CompassIcon />} />
        <StatCard label="Published" value={stats.published.value} trendPct={stats.published.trendPct} icon={<CheckIcon />} />
        <StatCard label="Draft" value={stats.draft.value} trendPct={stats.draft.trendPct} icon={<DraftIcon />} />
        <StatCard label="Featured" value={stats.featured.value} trendPct={stats.featured.trendPct} icon={<StarIcon />} />
      </div>

      {/* ================================================================= */}
      {/* FILTERS */}
      {/* ================================================================= */}
      <ExperienceFilters
        categories={categories}
        initialQuery={q}
        initialCategoryId={categoryId}
        initialStatus={status}
        initialFeatured={featured}
        view={view}
      />

      <p className="text-xs text-neutral-400">
        Showing {items.length === 0 ? 0 : (page - 1) * 20 + 1}
        {"–"}
        {(page - 1) * 20 + items.length} of {total} experience{total === 1 ? "" : "s"}
      </p>

      {/* ================================================================= */}
      {/* TABLE / GRID */}
      {/* ================================================================= */}
      <ExperienceTable items={items} view={view} />

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition ${
                p === page ? "bg-[#2b0934] text-white" : "border border-[#EAE6DF] text-neutral-600 hover:bg-[#FAF8F5]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
