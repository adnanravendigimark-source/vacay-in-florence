"use client";

import { useState, useTransition } from "react";
import { approveSupplierApplicationAction, rejectSupplierApplicationAction } from "@/app/admin/(protected)/suppliers/actions";
import type { PendingSupplierApplication } from "@/lib/data/admin/suppliers";
import { Modal, useToast } from "@/components/admin/ui";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function SupplierApplicationsQueue({ applications }: { applications: PendingSupplierApplication[] }) {
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState<PendingSupplierApplication | null>(null);
  const [reason, setReason] = useState("");
  const { showToast } = useToast();

  const approve = (id: string) => {
    startTransition(async () => {
      const result = await approveSupplierApplicationAction(id);
      if (!result.success) showToast(result.error ?? "Could not approve.", "error");
      else showToast("Application approved — added to the supplier roster.", "success");
    });
  };

  const reject = () => {
    if (!rejecting) return;
    const id = rejecting.id;
    startTransition(async () => {
      const result = await rejectSupplierApplicationAction(id, reason);
      if (!result.success) showToast(result.error ?? "Could not reject.", "error");
      else showToast("Application rejected.", "success");
      setRejecting(null);
      setReason("");
    });
  };

  return (
    <>
      <div className="space-y-3">
        {applications.map((app) => (
          <div key={app.id} className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{app.company || app.name}</p>
                <p className="text-xs text-neutral-500">
                  {app.name} · {app.email}
                  {app.phone ? ` · ${app.phone}` : ""}
                </p>
                {app.experienceType ? (
                  <p className="mt-1 text-xs text-neutral-500">Experience type: {app.experienceType}</p>
                ) : null}
                {app.website ? (
                  <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2b0934] hover:underline">
                    {app.website}
                  </a>
                ) : null}
                {app.message ? <p className="mt-2 text-sm text-neutral-700">{app.message}</p> : null}
                <p className="mt-1 text-[11px] text-neutral-400">Applied {dateFormatter.format(app.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => approve(app.id)}
                  className="rounded-xl bg-[#2b0934] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3d0d4a] disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setRejecting(app)}
                  className="rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-[#FAF8F5] disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject application">
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">
            Reject {rejecting?.company || rejecting?.name}&apos;s supplier application? You can leave a note for your
            own records.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            rows={3}
            className="w-full rounded-xl border border-[#EAE6DF] px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejecting(null)}
              className="rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={reject}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Reject application
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
