"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminSupplierFullProfile, SupplierStatus } from "@/lib/data/admin/suppliers";
import {
  setSupplierStatusAction,
  saveSupplierNoteAction,
  sendSupplierMessageAction,
} from "@/app/admin/(protected)/suppliers/actions";
import { Modal, useToast } from "@/components/admin/ui";

// Clean SVG Icons
function MailIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function GlobeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function FileTextIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function StatusBadge({ status }: { status: SupplierStatus }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Approved & Active
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Review
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    case "suspended":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          Suspended
        </span>
      );
  }
}

export function SupplierDetailView({ profile }: { profile: AdminSupplierFullProfile }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { supplier, quickStats, experiences, bookings, activities } = profile;

  type TabKey = "overview" | "experiences" | "bookings" | "documents" | "activity";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [noteText, setNoteText] = useState(supplier.notes || "");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const handleStatusChange = (newStatus: SupplierStatus) => {
    startTransition(async () => {
      const res = await setSupplierStatusAction(supplier.id, newStatus);
      if (res.success) {
        showToast(`Supplier status updated to ${newStatus}`, "success");
        router.refresh();
      } else {
        showToast(res.error || "Failed to update status", "error");
      }
    });
  };

  const handleSaveNote = () => {
    startTransition(async () => {
      const res = await saveSupplierNoteAction(supplier.id, noteText);
      if (res.success) {
        showToast("Admin note saved successfully", "success");
        router.refresh();
      } else {
        showToast(res.error || "Failed to save note", "error");
      }
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) {
      showToast("Please enter a subject and message", "error");
      return;
    }

    startTransition(async () => {
      const res = await sendSupplierMessageAction(supplier.id, contactSubject, contactMessage);
      if (res.success) {
        showToast(`Message logged and notification sent to ${supplier.name}`, "success");
        setIsContactModalOpen(false);
        setContactSubject("");
        setContactMessage("");
        router.refresh();
      } else {
        showToast(res.error || "Failed to dispatch message", "error");
      }
    });
  };

  const initialLetter = supplier.name?.trim()?.charAt(0)?.toUpperCase() || "S";

  // Determine if this is an approved/active or suspended supplier (established account)
  const isEstablishedAccount = supplier.status === "approved" || supplier.status === "suspended";

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/suppliers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#1b3b36] transition p-1.5 rounded-lg hover:bg-neutral-100"
          >
            <ArrowLeftIcon />
            <span>Suppliers</span>
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-semibold text-neutral-900 truncate max-w-[200px]">
            {supplier.name}
          </span>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-3 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <MailIcon />
            <span>Email Supplier</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Profile Banner */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity & Main Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#1b3b36] text-white flex items-center justify-center font-serif font-bold text-2xl shrink-0 shadow-xs">
              {initialLetter}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                  {supplier.name}
                </h1>
                <StatusBadge status={supplier.status} />
                <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[11px] font-medium">
                  {supplier.companyCategory || "Tour Operator"}
                </span>
              </div>

              {/* Meta information chips */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-2 text-xs text-neutral-500">
                {supplier.contactEmail && (
                  <a
                    href={`mailto:${supplier.contactEmail}`}
                    className="flex items-center gap-1 hover:text-[#1b3b36] transition"
                  >
                    <MailIcon />
                    <span>{supplier.contactEmail}</span>
                  </a>
                )}
                {supplier.contactPhone && (
                  <span className="flex items-center gap-1 text-neutral-600">
                    <PhoneIcon />
                    <span>{supplier.contactPhone}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-neutral-600">
                  <MapPinIcon />
                  <span>
                    {supplier.city ? `${supplier.city}, ${supplier.country || "Italy"}` : supplier.country || "Italy"}
                  </span>
                </span>
                {supplier.website && (
                  <a
                    href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#1b3b36] hover:underline font-medium"
                  >
                    <GlobeIcon />
                    <span>Website</span>
                    <ExternalLinkIcon />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (4 chips) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t lg:border-t-0 lg:border-l border-neutral-200/80 pt-4 lg:pt-0 lg:pl-6 shrink-0">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
              <p className="text-[10px] uppercase font-semibold text-neutral-400">Experiences</p>
              <p className="text-base font-bold text-neutral-900 mt-0.5">{quickStats.totalExperiences}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
              <p className="text-[10px] uppercase font-semibold text-neutral-400">Bookings</p>
              <p className="text-base font-bold text-neutral-900 mt-0.5">{quickStats.totalBookings}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
              <p className="text-[10px] uppercase font-semibold text-neutral-400">Gross Sales</p>
              <p className="text-base font-bold text-neutral-900 mt-0.5">
                €{quickStats.totalEarnings.toLocaleString()}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
              <p className="text-[10px] uppercase font-semibold text-neutral-400">Commission</p>
              <p className="text-base font-bold text-emerald-700 mt-0.5">{quickStats.commissionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Clean Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-neutral-200/80 text-xs font-semibold overflow-x-auto pb-0.5">
        {[
          { key: "overview", label: "Overview" },
          { key: "experiences", label: `Experiences (${experiences.length})` },
          { key: "bookings", label: `Bookings (${bookings.length})` },
          { key: "documents", label: `Documents (${supplier.documents.length})` },
          { key: "activity", label: "Activity" },
        ].map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key as TabKey)}
              className={`px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-[#1b3b36] text-[#1b3b36] font-bold"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* ======================= OVERVIEW TAB ======================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Details & Linked Tours */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information Card */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Business Profile</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Primary Contact Person</span>
                  <span className="font-semibold text-neutral-800 mt-0.5 block">
                    {supplier.contactName || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px]">Business Address</span>
                  <span className="font-semibold text-neutral-800 mt-0.5 block">
                    {supplier.address || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px]">VAT / Tax ID</span>
                  <span className="font-semibold text-neutral-800 mt-0.5 block font-mono">
                    {supplier.taxId || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px]">Registered Date</span>
                  <span className="font-semibold text-neutral-800 mt-0.5 block">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(supplier.createdAt))}
                  </span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-neutral-100">
                  <span className="text-neutral-400 block text-[11px]">About / Description</span>
                  <p className="text-neutral-700 mt-1 leading-relaxed text-xs">
                    {supplier.description || supplier.about || "No description provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* Linked Experiences Preview */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">
                  Experiences ({experiences.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("experiences")}
                  className="text-xs font-semibold text-[#1b3b36] hover:underline"
                >
                  View all &rarr;
                </button>
              </div>

              {experiences.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-xl">
                  No experiences linked to this supplier.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {experiences.slice(0, 4).map((exp) => (
                    <Link
                      key={exp.id}
                      href={`/admin/experiences/${exp.id}`}
                      className="group rounded-xl border border-neutral-200/80 bg-white p-3 hover:border-neutral-300 hover:shadow-xs transition flex gap-3"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        <img
                          src={exp.imageUrl}
                          alt={exp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-xs text-neutral-900 group-hover:text-[#1b3b36] truncate">
                            {exp.title}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{exp.categoryName}</p>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-neutral-900">€{exp.priceAmount}</span>
                          <span className="text-neutral-500">{exp.bookingsCount} bookings</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings Preview */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">
                  Recent Bookings ({bookings.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("bookings")}
                  className="text-xs font-semibold text-[#1b3b36] hover:underline"
                >
                  View all &rarr;
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="py-6 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-xl">
                  No bookings recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200/80 text-[11px] font-semibold text-neutral-400 uppercase">
                        <th className="pb-2">Order</th>
                        <th className="pb-2">Experience</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.orderId} className="hover:bg-neutral-50/60">
                          <td className="py-2.5 font-mono text-neutral-600">#{b.orderId.substring(0, 8)}</td>
                          <td className="py-2.5 font-medium text-neutral-900 truncate max-w-[180px]">
                            {b.productTitle}
                          </td>
                          <td className="py-2.5 text-neutral-600 truncate max-w-[140px]">{b.customerName}</td>
                          <td className="py-2.5 text-right font-semibold text-neutral-900">
                            €{b.subtotalAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right 1 Col: Status Switcher, Notes, Documents */}
          <div className="space-y-6">
            {/* Account Status Control Card */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3.5">
              <h3 className="text-sm font-bold text-neutral-900">Account Status</h3>
              <p className="text-xs text-neutral-500">
                {isEstablishedAccount
                  ? "Control platform access and public catalog status."
                  : "Review and take action on this supplier application."}
              </p>

              {/* Once account is approved / established, only show Approved and Suspended buttons */}
              {isEstablishedAccount ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isPending || supplier.status === "approved"}
                    onClick={() => handleStatusChange("approved")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                      supplier.status === "approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                        : "bg-white text-neutral-700 border-neutral-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 cursor-pointer"
                    }`}
                  >
                    ✓ Approved
                  </button>

                  <button
                    type="button"
                    disabled={isPending || supplier.status === "suspended"}
                    onClick={() => handleStatusChange("suspended")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                      supplier.status === "suspended"
                        ? "bg-neutral-200 text-neutral-800 border-neutral-400 font-bold"
                        : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100 cursor-pointer"
                    }`}
                  >
                    ⏸ Suspended
                  </button>
                </div>
              ) : (
                /* For Pending / Rejected states */
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange("approved")}
                    className="py-2 px-3 rounded-xl text-xs font-semibold transition bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer text-center"
                  >
                    ✓ Approve Account
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange("rejected")}
                    className="py-2 px-3 rounded-xl text-xs font-semibold transition bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 cursor-pointer text-center"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>

            {/* Admin Private Notes */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900">Admin Notes</h3>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write private notes about this supplier..."
                className="w-full rounded-xl border border-neutral-200 p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none transition"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveNote}
                className="w-full rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white py-2 text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Saving..." : "Save Note"}
              </button>
            </div>

            {/* Uploaded Documents List */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Documents</h3>
                <span className="text-[11px] font-semibold text-neutral-400">
                  {supplier.documents.length} file{supplier.documents.length !== 1 ? "s" : ""}
                </span>
              </div>

              {supplier.documents.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3 text-center border border-dashed border-neutral-200 rounded-xl">
                  No documents uploaded.
                </p>
              ) : (
                <div className="space-y-2">
                  {supplier.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileTextIcon className="w-4 h-4 text-neutral-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{doc.title}</p>
                          <p className="text-[10px] text-neutral-400 truncate">{doc.filename}</p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#1b3b36] hover:underline shrink-0 ml-2"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================= EXPERIENCES TAB ======================= */}
      {activeTab === "experiences" && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Experiences by {supplier.name} ({experiences.length})
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              All tours and activities linked to this supplier.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Bookings</th>
                  <th className="py-3 px-4 text-center">Revenue</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {experiences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400 text-xs">
                      No experiences found for this supplier.
                    </td>
                  </tr>
                ) : (
                  experiences.map((exp) => (
                    <tr key={exp.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={exp.imageUrl}
                            alt={exp.title}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 bg-neutral-100"
                          />
                          <span className="font-semibold text-neutral-900">{exp.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{exp.categoryName}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {exp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-neutral-800">
                        {exp.bookingsCount}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-neutral-900">
                        €{exp.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/experiences/${exp.id}`}
                          className="font-semibold text-[#1b3b36] hover:underline"
                        >
                          View Tour &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= BOOKINGS TAB ======================= */}
      {activeTab === "bookings" && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Customer Bookings ({bookings.length})
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live orders and guest bookings registered for this supplier.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400 text-xs">
                      No customer bookings found for this supplier yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.orderId} className="hover:bg-neutral-50/60 transition">
                      <td className="py-3 px-4 font-mono font-medium text-neutral-700">
                        #{b.orderId.substring(0, 8)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">{b.productTitle}</td>
                      <td className="py-3 px-4 text-neutral-600">
                        <span className="block font-medium">{b.customerName}</span>
                        <span className="text-[10px] text-neutral-400">{b.customerEmail}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{b.date}</td>
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        €{b.subtotalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= DOCUMENTS TAB ======================= */}
      {activeTab === "documents" && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-neutral-900">Compliance & Business Documents</h3>
          {supplier.documents.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-xl">
              No compliance documents uploaded for this supplier.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {supplier.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-neutral-200/80 hover:bg-neutral-50/60 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600">
                      <FileTextIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">{doc.title}</p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {doc.filename} {doc.fileSize ? `· ${doc.fileSize}` : ""}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold shadow-2xs"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= ACTIVITY TAB ======================= */}
      {activeTab === "activity" && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-neutral-900">Activity & Audit Trail</h3>
          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 bg-neutral-50/60 text-xs"
              >
                <span className="text-emerald-700 font-bold">●</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-neutral-900">{act.title}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{act.dateStr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Modals */}

      {/* Contact Supplier Modal */}
      <Modal open={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title={`Message ${supplier.name}`}>
        <form onSubmit={handleSendMessage} className="space-y-4 pt-1 text-xs">
          <p className="text-neutral-500">
            Send an official in-app notice to {supplier.name}
            {supplier.contactEmail ? ` (${supplier.contactEmail})` : ""}.
          </p>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Subject</label>
            <input
              type="text"
              required
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="e.g. Tour update or profile verification"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Message Body</label>
            <textarea
              rows={4}
              required
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-[#1b3b36] focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-100">
            {supplier.contactEmail ? (
              <a
                href={`mailto:${supplier.contactEmail}?subject=${encodeURIComponent(contactSubject || "Message from VACAY Florence")}&body=${encodeURIComponent(contactMessage)}`}
                className="text-xs font-semibold text-[#1b3b36] hover:underline inline-flex items-center gap-1"
                target="_blank"
                rel="noreferrer"
              >
                <MailIcon />
                <span>Open in Mail App &rarr;</span>
              </a>
            ) : (
              <span className="text-[11px] text-neutral-400">No external email set</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-4 py-2 text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Sending..." : "Send In-App Notice"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
