"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProductAction } from "@/app/admin/(protected)/experiences/actions";
import type { AdminProductListItem, ProductStatus } from "@/lib/data/admin/products";
import { Modal, useToast } from "@/components/admin/ui";

const STATUS_STYLE: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  live: { bg: "#EAF6EE", text: "#1F7A3F", label: "Published" },
  draft: { bg: "#F0ECE6", text: "#6B6B6B", label: "Draft" },
  pending_review: { bg: "#FEF7E6", text: "#B47818", label: "Pending review" },
  paused: { bg: "#FDF0ED", text: "#D94F3D", label: "Paused" },
  rejected: { bg: "#FDF0ED", text: "#D94F3D", label: "Rejected" },
  changes_requested: { bg: "#FEF7E6", text: "#B47818", label: "Changes requested" },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    // currency should always be "EUR" (single-currency site), so this
    // only fires for a pre-existing bad value — show the symbol rather
    // than leaking the raw stored code (e.g. "EUR 45") onto the page.
    return `€${amount.toFixed(0)}`;
  }
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

// A product with no attraction is invisible on the attraction-first public
// flow (/experiences -> attraction -> its tickets) — it will never appear
// anywhere a customer can reach it, even once published, so this is flagged
// the same amber tone as "Pending review", not a neutral gray.
function AttractionBadge({ name }: { name: string | null }) {
  if (name) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-[#F0ECE6] px-2.5 py-1 text-[10.5px] font-medium text-neutral-600">
        {name}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
      style={{ backgroundColor: "#FEF7E6", color: "#B47818" }}
      title="Won't appear on /experiences until assigned to an attraction"
    >
      Unassigned
    </span>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

const iconBtnBase =
  "flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-50 disabled:pointer-events-none";
const iconBtnNeutral = `${iconBtnBase} border-[#EAE6DF] text-neutral-500 hover:border-[#2b0934]/30 hover:bg-[#FAF8F5] hover:text-[#2b0934]`;
const iconBtnDanger = `${iconBtnBase} border-[#FDE4DE] text-[#D94F3D] hover:bg-[#FDF0ED]`;

function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link href={href} title={label} aria-label={label} className={iconBtnNeutral}>
      {children}
    </Link>
  );
}

function PreviewLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={label} aria-label={label} className={iconBtnNeutral}>
      {children}
    </a>
  );
}

function IconButton({
  onClick,
  label,
  danger,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={danger ? iconBtnDanger : iconBtnNeutral}
    >
      {children}
    </button>
  );
}

const bulkBtn =
  "rounded-lg border border-[#2b0934]/20 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2b0934] transition hover:bg-[#2b0934]/5 disabled:opacity-50";
const bulkBtnDanger =
  "rounded-lg border border-[#F3C7BC] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#D94F3D] transition hover:bg-[#FDF0ED] disabled:opacity-50";

function GridCard({
  item,
  onDelete,
  isPending,
}: {
  item: AdminProductListItem;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered/uploaded URL, not an optimizable local asset
          <img src={item.image.src} alt="" className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute right-2.5 top-2.5">
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className="p-4">
        <p className="truncate text-sm font-semibold text-neutral-900">{item.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-neutral-400">{item.shortDescription}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex rounded-full bg-[#F0ECE6] px-2 py-0.5 text-[10px] font-medium text-neutral-600">
            {item.categoryName}
          </span>
          <span className="text-[11px] text-neutral-400">{item.durationLabel}</span>
        </div>
        <div className="mt-1.5">
          <AttractionBadge name={item.attractionName} />
        </div>
        <div className="mt-3 border-t border-[#F0ECE6] pt-3">
          <span className="text-sm font-semibold text-neutral-900">
            {formatPrice(item.priceFromAmount, item.priceFromCurrency)}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <IconLink href={`/admin/experiences/${item.id}`} label="Edit">
            <EditIcon />
          </IconLink>
          <PreviewLink
            href={`/experiences/${item.slug}${item.status !== "live" ? "?preview=1" : ""}`}
            label="Preview"
          >
            <EyeIcon />
          </PreviewLink>
          <IconButton label="Delete" danger disabled={isPending} onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export function ExperienceTable({ items, view }: { items: AdminProductListItem[]; view: "list" | "grid" }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AdminProductListItem | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteProductAction(target.id, target.slug);
      if (result.success) {
        showToast("Experience deleted.", "success");
        router.refresh();
      } else {
        showToast(result.error ?? "Could not delete this experience.", "error");
      }
      setDeleteTarget(null);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <p className="text-sm font-medium text-neutral-700">No experiences match your filters.</p>
        <p className="mt-1 text-xs text-neutral-400">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <GridCard
              key={item.id}
              item={item}
              onDelete={() => setDeleteTarget(item)}
              isPending={isPending}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#EAE6DF] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
          <table className="w-full min-w-[1040px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <th className="px-3 py-3.5 pl-5">Experience</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Attraction</th>
                <th className="px-3 py-3.5">Price</th>
                <th className="px-3 py-3.5">Duration</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5">Created</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE6]">
              {items.map((item) => (
                <tr key={item.id} className="transition hover:bg-[#FAF8F5]/60">
                  <td className="min-w-[220px] px-3 py-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered/uploaded URL, not an optimizable local asset
                        <img
                          src={item.image.src}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-lg border border-[#EAE6DF] object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 shrink-0 rounded-lg bg-neutral-100" />
                      )}
                      <div className="min-w-0 max-w-[220px]">
                        <p className="truncate font-semibold text-neutral-900">{item.title}</p>
                        <p className="truncate text-[11px] text-neutral-400">{item.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex whitespace-nowrap rounded-full bg-[#F0ECE6] px-2.5 py-1 text-[10.5px] font-medium text-neutral-600">
                      {item.categoryName}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <AttractionBadge name={item.attractionName} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-neutral-900">
                    {formatPrice(item.priceFromAmount, item.priceFromCurrency)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-neutral-600">{item.durationLabel}</td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-neutral-500">{dateFormatter.format(item.createdAt)}</td>
                  <td className="py-3.5 pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <IconLink href={`/admin/experiences/${item.id}`} label="Edit">
                        <EditIcon />
                      </IconLink>
                      <PreviewLink
                        href={`/experiences/${item.slug}${item.status !== "live" ? "?preview=1" : ""}`}
                        label="Preview"
                      >
                        <EyeIcon />
                      </PreviewLink>
                      <IconButton label="Delete" danger disabled={isPending} onClick={() => setDeleteTarget(item)}>
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this experience?"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-[#EAE6DF] px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-[#FAF8F5]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl bg-[#D94F3D] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#c2402f] disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          This permanently removes &ldquo;{deleteTarget?.title}&rdquo; and its images and pricing options. If it has
          any bookings or is in a customer&rsquo;s cart, the delete will be blocked — pause it instead.
        </p>
      </Modal>
    </div>
  );
}
