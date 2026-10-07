"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminSupplierListItem, SupplierStatus, SupplierStatsSummary, PendingSupplierApplication } from "@/lib/data/admin/suppliers";
import {
  createSupplierAction,
  setSupplierStatusAction,
  bulkSetSuppliersStatusAction,
  deleteSupplierAction,
  bulkDeleteSuppliersAction,
  approveSupplierApplicationAction,
  rejectSupplierApplicationAction,
} from "@/app/admin/(protected)/suppliers/actions";
import { Modal, useToast } from "@/components/admin/ui";

const ITEMS_PER_PAGE = 20;

// Clean Feather/Lucide-style SVG Icons
function UsersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShieldAlertIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function GridIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ListIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function MoreVerticalIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function PlusIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CloseIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SupplierAvatar({ name, category }: { name: string; category?: string | null }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "S";
  
  // Color determination based on initial for clean consistent pastel avatar
  const colors = [
    "bg-emerald-100 text-emerald-800 border-emerald-200",
    "bg-teal-100 text-teal-800 border-teal-200",
    "bg-sky-100 text-sky-800 border-sky-200",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-stone-100 text-stone-800 border-stone-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
  ];
  const charCode = initial.charCodeAt(0) || 0;
  const colorClass = colors[charCode % colors.length];

  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold text-sm border shrink-0 ${colorClass}`}>
      {initial}
    </div>
  );
}

function StatusBadge({ status }: { status: SupplierStatus }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    case "suspended":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          Suspended
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
          {status}
        </span>
      );
  }
}

function formatSimpleDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

interface SuppliersViewProps {
  initialSuppliers: AdminSupplierListItem[];
  pendingApplications?: PendingSupplierApplication[];
  stats: SupplierStatsSummary;
}

export function SuppliersView({ initialSuppliers, pendingApplications = [], stats }: SuppliersViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [deleteConfirmSupplier, setDeleteConfirmSupplier] = useState<AdminSupplierListItem | null>(null);
  const [showPendingQueue, setShowPendingQueue] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    country: "Italy",
    companyCategory: "Tour Operator",
    status: "approved" as SupplierStatus,
    commissionRateOverride: "",
    notes: "",
  });

  // Close actions menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (activeActionMenuId && !(e.target as Element)?.closest(".supplier-action-menu")) {
        setActiveActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeActionMenuId]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const s of initialSuppliers) {
      if (s.country) set.add(s.country);
    }
    return Array.from(set).sort();
  }, [initialSuppliers]);

  // Counts for status tabs
  const statusCounts = useMemo(() => {
    const counts = { all: initialSuppliers.length, approved: 0, pending: 0, suspended: 0, rejected: 0 };
    for (const s of initialSuppliers) {
      if (s.status in counts) {
        counts[s.status as keyof typeof counts]++;
      }
    }
    return counts;
  }, [initialSuppliers]);

  const filteredSuppliers = useMemo(() => {
    return initialSuppliers.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.contactEmail?.toLowerCase().includes(q) ?? false;
        const matchesCompany = s.companyName?.toLowerCase().includes(q) ?? false;
        const matchesCategory = s.companyCategory?.toLowerCase().includes(q) ?? false;
        const matchesCity = s.city?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesEmail && !matchesCompany && !matchesCategory && !matchesCity) {
          return false;
        }
      }

      if (statusFilter !== "all" && s.status !== statusFilter) {
        return false;
      }

      if (countryFilter !== "all" && s.country?.toLowerCase() !== countryFilter.toLowerCase()) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "experiences") {
        return b.experiencesCount - a.experiencesCount;
      }
      if (sortBy === "bookings") {
        return b.bookingsCount - a.bookingsCount;
      }
      return 0;
    });
  }, [initialSuppliers, searchQuery, statusFilter, countryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE));
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuppliers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSuppliers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedSuppliers.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSetStatus = (id: string, newStatus: SupplierStatus) => {
    setActiveActionMenuId(null);
    startTransition(async () => {
      const res = await setSupplierStatusAction(id, newStatus);
      if (res.success) {
        showToast(`Supplier marked as ${newStatus}`, "success");
        router.refresh();
      } else {
        showToast(res.error || "Failed to update status", "error");
      }
    });
  };

  const handleBulkStatus = (status: SupplierStatus) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const res = await bulkSetSuppliersStatusAction(ids, status);
      if (res.success) {
        showToast(`Updated ${ids.length} suppliers to ${status}`, "success");
        setSelectedIds(new Set());
        router.refresh();
      } else {
        showToast(res.error || "Bulk update failed", "error");
      }
    });
  };

  const handleDeleteSupplier = (id: string) => {
    setActiveActionMenuId(null);
    startTransition(async () => {
      const res = await deleteSupplierAction(id);
      if (res.success) {
        showToast("Supplier deleted successfully", "success");
        setDeleteConfirmSupplier(null);
        router.refresh();
      } else {
        showToast(res.error || "Failed to delete supplier", "error");
      }
    });
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Please enter a supplier name", "error");
      return;
    }

    startTransition(async () => {
      const res = await createSupplierAction({
        name: formData.name,
        contactName: formData.contactName || null,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        website: formData.website || null,
        country: formData.country || "Italy",
        status: formData.status,
        about: formData.companyCategory || null,
        commissionRateOverride: formData.commissionRateOverride ? parseFloat(formData.commissionRateOverride) : null,
        notes: formData.notes || null,
      });

      if (res.success) {
        showToast("Supplier created successfully", "success");
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          website: "",
          country: "Italy",
          companyCategory: "Tour Operator",
          status: "approved",
          commissionRateOverride: "",
          notes: "",
        });
        router.refresh();
      } else {
        showToast(res.error || "Failed to create supplier", "error");
      }
    });
  };

  const isAllSelected = paginatedSuppliers.length > 0 && paginatedSuppliers.every((s) => selectedIds.has(s.id));

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Suppliers
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Manage registered tour suppliers, review new applications, and configure partner access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingApplications.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPendingQueue(!showPendingQueue)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition shadow-xs"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Applications ({pendingApplications.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-4 py-2 text-xs font-semibold shadow-xs transition active:scale-[0.99]"
          >
            <PlusIcon />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* 2. Pending Applications Drawer */}
      {showPendingQueue && pendingApplications.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-950">
                Pending Supplier Applications ({pendingApplications.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPendingQueue(false)}
              className="text-xs font-medium text-amber-800 hover:text-amber-950 underline"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingApplications.map((app) => (
              <div key={app.id} className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-xs text-neutral-900 truncate">{app.company || app.name}</p>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      New
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 truncate">
                    {app.name} &bull; {app.email}
                  </p>
                  {app.experienceType && (
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Type: <span className="font-medium text-neutral-800">{app.experienceType}</span>
                    </p>
                  )}
                  {app.message && (
                    <p className="text-[11px] text-neutral-600 mt-2 bg-neutral-50 p-2 rounded-lg line-clamp-2 italic border border-neutral-100">
                      &quot;{app.message}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-neutral-100">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const res = await approveSupplierApplicationAction(app.id);
                        if (res.success) {
                          showToast("Supplier application approved!", "success");
                          router.refresh();
                        } else {
                          showToast(res.error || "Approval failed", "error");
                        }
                      });
                    }}
                    className="rounded-lg bg-[#1b3b36] hover:bg-[#132c28] text-white px-3 py-1 text-xs font-medium transition disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      const reason = window.prompt("Rejection reason (optional):") ?? "";
                      startTransition(async () => {
                        const res = await rejectSupplierApplicationAction(app.id, reason);
                        if (res.success) {
                          showToast("Application rejected", "success");
                          router.refresh();
                        } else {
                          showToast(res.error || "Rejection failed", "error");
                        }
                      });
                    }}
                    className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 px-3 py-1 text-xs font-medium transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Sleek & Clean Metrics Bar (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Roster */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Suppliers</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
              <UsersIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{stats.total}</span>
            <span className="text-[11px] font-medium text-emerald-600">Active roster</span>
          </div>
        </div>

        {/* Approved Active */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Approved</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircleIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{stats.approved}</span>
            <span className="text-[11px] font-medium text-neutral-400">
              {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}% of total` : "—"}
            </span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ClockIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{stats.pending}</span>
            {stats.pending > 0 ? (
              <span className="text-[11px] font-medium text-amber-700">Needs action</span>
            ) : (
              <span className="text-[11px] font-medium text-neutral-400">All cleared</span>
            )}
          </div>
        </div>

        {/* Suspended or Rejected */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Suspended / Rejected</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
              <ShieldAlertIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{stats.suspended + stats.rejected}</span>
            <span className="text-[11px] font-medium text-neutral-400">Restricted</span>
          </div>
        </div>
      </div>

      {/* 4. Filter and Controls Bar */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200/80 pb-3">
          {[
            { id: "all", label: "All Suppliers", count: statusCounts.all },
            { id: "approved", label: "Approved", count: statusCounts.approved },
            { id: "pending", label: "Pending", count: statusCounts.pending },
            { id: "suspended", label: "Suspended", count: statusCounts.suspended },
            { id: "rejected", label: "Rejected", count: statusCounts.rejected },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-[#1b3b36] text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-neutral-200/70 text-neutral-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Selects, and View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, company, city..."
              className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-8 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filters & View Toggle */}
          <div className="flex items-center gap-2">
            {/* Country Selector */}
            <div className="relative">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-7 text-xs font-medium text-neutral-700 shadow-xs focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none cursor-pointer"
              >
                <option value="all">All Countries</option>
                <option value="italy">Italy</option>
                {countries
                  .filter((c) => c.toLowerCase() !== "italy")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400">
                <ChevronDownIcon />
              </div>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-7 text-xs font-medium text-neutral-700 shadow-xs focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none cursor-pointer"
              >
                <option value="latest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="experiences">Most Experiences</option>
                <option value="bookings">Most Bookings</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400">
                <ChevronDownIcon />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "table" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="Table view"
                aria-label="Table view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <GridIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bulk Actions Floating Bar */}
      {selectedIds.size > 0 && (
        <div className="rounded-xl border border-[#1b3b36]/20 bg-[#1b3b36]/5 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1b3b36] text-[11px] text-white">
              {selectedIds.size}
            </span>
            <span>supplier{selectedIds.size > 1 ? "s" : ""} selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatus("approved")}
              className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus("suspended")}
              className="rounded-lg bg-neutral-700 hover:bg-neutral-800 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition"
            >
              Suspend
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${selectedIds.size} suppliers?`)) {
                  startTransition(async () => {
                    const res = await bulkDeleteSuppliersAction(Array.from(selectedIds));
                    if (res.success) {
                      showToast("Selected suppliers deleted", "success");
                      setSelectedIds(new Set());
                      router.refresh();
                    } else {
                      showToast(res.error || "Delete failed", "error");
                    }
                  });
                }
              }}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-600 px-3 py-1.5 text-xs font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 6. Content Views */}
      {viewMode === "table" ? (
        /* ======================== CLEAN TABLE VIEW ======================== */
        <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-neutral-300 text-[#1b3b36] focus:ring-[#1b3b36] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Experiences</th>
                <th className="px-4 py-3 text-center">Bookings</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-neutral-500">
                    <p className="text-sm font-semibold text-neutral-800">No suppliers found</p>
                    <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  const isMenuOpen = activeActionMenuId === s.id;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-neutral-50/60 transition-colors ${
                        isSelected ? "bg-[#1b3b36]/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="h-3.5 w-3.5 rounded border-neutral-300 text-[#1b3b36] focus:ring-[#1b3b36] cursor-pointer"
                        />
                      </td>

                      {/* Supplier Column */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <SupplierAvatar name={s.name} category={s.companyCategory} />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/suppliers/${s.id}`}
                              className="font-semibold text-neutral-900 hover:text-[#1b3b36] hover:underline block truncate"
                            >
                              {s.name}
                            </Link>
                            <span className="block text-[11px] text-neutral-400 truncate">
                              {s.contactEmail || "No contact email"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Column */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-medium truncate max-w-[150px]">
                          {s.companyCategory || s.companyName || "Tour Operator"}
                        </span>
                      </td>

                      {/* Location Column */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">
                            {s.country?.toLowerCase() === "italy" || s.countryCode?.toUpperCase() === "IT" ? "🇮🇹" : "🌍"}
                          </span>
                          <span className="text-neutral-700 font-medium truncate max-w-[120px]">
                            {s.city ? `${s.city}, ${s.country || "Italy"}` : s.country || "Italy"}
                          </span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={s.status} />
                      </td>

                      {/* Experiences Count */}
                      <td className="px-4 py-3.5 text-center font-semibold text-neutral-800">
                        {s.experiencesCount}
                      </td>

                      {/* Bookings Count */}
                      <td className="px-4 py-3.5 text-center font-semibold text-neutral-800">
                        {s.bookingsCount}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-neutral-500 whitespace-nowrap">
                        {formatSimpleDate(s.createdAt)}
                      </td>

                      {/* Action Menu */}
                      <td className="px-4 py-3.5 text-right relative">
                        <div className="supplier-action-menu inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveActionMenuId(isMenuOpen ? null : s.id)}
                            className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreVerticalIcon />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-3 mt-1 w-44 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg z-30 animate-fade-in text-left">
                              <Link
                                href={`/admin/suppliers/${s.id}`}
                                className="block px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-[#1b3b36]"
                              >
                                View / Edit Profile
                              </Link>
                              <Link
                                href={`/admin/experiences/tickets?supplier=${s.id}`}
                                className="block px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-[#1b3b36]"
                              >
                                Linked Tours ({s.experiencesCount})
                              </Link>

                              <div className="my-1 border-t border-neutral-100" />
                              <p className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Set Status
                              </p>

                              {s.status !== "approved" && (
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(s.id, "approved")}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 font-medium"
                                >
                                  Mark as Approved
                                </button>
                              )}
                              {s.status !== "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(s.id, "pending")}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 font-medium"
                                >
                                  Mark as Pending
                                </button>
                              )}
                              {s.status !== "suspended" && (
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(s.id, "suspended")}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 font-medium"
                                >
                                  Mark as Suspended
                                </button>
                              )}
                              {s.status !== "rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(s.id, "rejected")}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 font-medium"
                                >
                                  Mark as Rejected
                                </button>
                              )}

                              <div className="my-1 border-t border-neutral-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveActionMenuId(null);
                                  setDeleteConfirmSupplier(s);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                              >
                                Delete Supplier
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ======================== CLEAN GRID VIEW ======================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paginatedSuppliers.length === 0 ? (
            <div className="col-span-full rounded-xl border border-neutral-200/80 bg-white p-12 text-center text-neutral-500">
              <p className="text-sm font-semibold text-neutral-800">No suppliers found</p>
              <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            paginatedSuppliers.map((s) => {
              const isSelected = selectedIds.has(s.id);

              return (
                <div
                  key={s.id}
                  className={`rounded-xl border border-neutral-200/80 bg-white p-4.5 shadow-xs hover:border-neutral-300 transition flex flex-col justify-between ${
                    isSelected ? "ring-2 ring-[#1b3b36]" : ""
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <SupplierAvatar name={s.name} category={s.companyCategory} />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/suppliers/${s.id}`}
                            className="font-semibold text-sm text-neutral-900 hover:text-[#1b3b36] hover:underline block truncate"
                          >
                            {s.name}
                          </Link>
                          <span className="block text-[11px] text-neutral-400 truncate">
                            {s.companyCategory || s.companyName || "Tour Operator"}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>

                    {/* Details */}
                    <div className="mt-3.5 pt-3 border-t border-neutral-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-neutral-600">
                        <span className="text-neutral-400 text-[11px]">Email:</span>
                        <span className="font-medium text-neutral-800 truncate max-w-[170px]">
                          {s.contactEmail || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span className="text-neutral-400 text-[11px]">Location:</span>
                        <span className="font-medium text-neutral-800">
                          🇮🇹 {s.city ? `${s.city}, ${s.country || "Italy"}` : s.country || "Italy"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span className="text-neutral-400 text-[11px]">Experiences / Bookings:</span>
                        <span className="font-semibold text-neutral-900">
                          {s.experiencesCount} tours &bull; {s.bookingsCount} orders
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(s.id)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? "bg-[#1b3b36] text-white border-[#1b3b36]"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                    <Link
                      href={`/admin/suppliers/${s.id}`}
                      className="text-xs font-semibold text-[#1b3b36] hover:underline"
                    >
                      View Profile &rarr;
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 7. Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-neutral-500">
        <p>
          Showing{" "}
          <span className="font-medium text-neutral-800">
            {filteredSuppliers.length === 0
              ? 0
              : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredSuppliers.length
                )}`}
          </span>{" "}
          of <span className="font-medium text-neutral-800">{filteredSuppliers.length}</span> suppliers
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer text-xs"
            aria-label="Previous Page"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentPage === pageNum
                  ? "bg-[#1b3b36] text-white shadow-xs"
                  : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-7 h-7 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer text-xs"
            aria-label="Next Page"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* 8. Add Supplier Modal */}
      <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Supplier">
        <form onSubmit={handleCreateSupplier} className="space-y-4 pt-1 text-xs">
          <p className="text-neutral-500">
            Create a new supplier profile to manage experiences, assign tours, and set commission rates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Supplier / Brand Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Florence Heritage Tours"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Company Category / Type</label>
              <select
                value={formData.companyCategory}
                onChange={(e) => setFormData({ ...formData, companyCategory: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              >
                <option value="Tour Operator">Tour Operator</option>
                <option value="Boat Tours">Boat Tours</option>
                <option value="Outdoor & Cultural Tours">Outdoor & Cultural Tours</option>
                <option value="Museum Tours">Museum Tours</option>
                <option value="Wine & Food Tours">Wine & Food Tours</option>
                <option value="Day Trips">Day Trips</option>
                <option value="Adventure Tours">Adventure Tours</option>
                <option value="Walking & City Tours">Walking & City Tours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as SupplierStatus })}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="e.g. Marco Rossi"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="e.g. contact@supplier.com"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="e.g. +39 055 123456"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Italy"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://supplier.com"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Commission Override (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRateOverride}
                onChange={(e) => setFormData({ ...formData, commissionRateOverride: e.target.value })}
                placeholder="Default (20%)"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Internal Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Private internal notes regarding this supplier..."
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-4 py-2 text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Add Supplier"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 9. Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirmSupplier}
        onClose={() => setDeleteConfirmSupplier(null)}
        title="Delete Supplier"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-neutral-600">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-neutral-900">{deleteConfirmSupplier?.name}</span>?
            This will remove their profile and decouple linked products.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmSupplier(null)}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => deleteConfirmSupplier && handleDeleteSupplier(deleteConfirmSupplier.id)}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold transition disabled:opacity-50"
            >
              {isPending ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
