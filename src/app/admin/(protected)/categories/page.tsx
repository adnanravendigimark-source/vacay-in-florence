import type { Metadata } from "next";
import Link from "next/link";
import { listAdminCategories } from "@/lib/data/admin/categories";
import { CategoryTable } from "@/components/admin/category-table";

export const metadata: Metadata = {
  title: "Categories | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminCategoriesPage() {
  const items = await listAdminCategories();
  const publishedCount = items.filter((c) => c.status === "published").length;
  const featuredCount = items.filter((c) => c.featured).length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Categories
          </Link>{" "}
          / Manage Categories
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
              Categories
            </h1>
            <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
              Organize experiences into browsable categories. Drag order affects the public Categories page.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/categories"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6DF] bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-[#FAF8F5]"
            >
              <span>View Public Page</span>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2b0934] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3d0d4a]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add New Category</span>
            </Link>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        {items.length} categor{items.length === 1 ? "y" : "ies"} · {publishedCount} published · {featuredCount} featured
      </p>

      <CategoryTable items={items} />
    </div>
  );
}
