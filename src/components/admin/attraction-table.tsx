"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  deleteAttractionAction,
  setAttractionStatusAction,
} from "@/app/admin/(protected)/experiences/attractions/actions";
import type { AdminAttractionListItem } from "@/lib/data/admin/attractions";
import type { AttractionStatus } from "@/lib/types";
import { Table, THead, TBody, TR, TH, TD, Badge, Button, Modal, useToast } from "@/components/admin/ui";

const STATUS_TONE: Record<AttractionStatus, "success" | "neutral"> = {
  published: "success",
  draft: "neutral",
};

export function AttractionTable({ items }: { items: AdminAttractionListItem[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AdminAttractionListItem | null>(null);

  function handleToggleStatus(item: AdminAttractionListItem) {
    const next: AttractionStatus = item.status === "published" ? "draft" : "published";
    startTransition(async () => {
      const result = await setAttractionStatusAction(item.id, next, item.slug);
      if (result.success) {
        showToast(next === "published" ? "Attraction published." : "Attraction unpublished.", "success");
        router.refresh();
      } else {
        showToast(result.error ?? "Could not update status.", "error");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteAttractionAction(target.id, target.slug);
      if (result.success) {
        showToast("Attraction deleted.", "success");
        router.refresh();
      } else {
        showToast(result.error ?? "Could not delete this attraction.", "error");
      }
      setDeleteTarget(null);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <p className="text-sm font-medium text-neutral-700">No attractions yet.</p>
        <p className="mt-1 text-xs text-neutral-400">
          Add your first attraction (e.g. &quot;Uffizi Gallery&quot;) to start grouping tickets under it.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <THead>
          <TR>
            <TH>Attraction</TH>
            <TH>Status</TH>
            <TH className="w-28 text-center">Tickets</TH>
            <TH className="w-40 text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((item) => (
            <TR key={item.id}>
              <TD>
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                    <Image src={item.imageUrl} alt={item.imageAlt} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{item.name}</p>
                    <p className="truncate text-xs text-ink-faint">/{item.slug}</p>
                  </div>
                </div>
              </TD>
              <TD>
                <button type="button" onClick={() => handleToggleStatus(item)} disabled={isPending} className="disabled:opacity-50">
                  <Badge tone={STATUS_TONE[item.status]}>{item.status === "published" ? "Published" : "Draft"}</Badge>
                </button>
              </TD>
              <TD className="text-center text-ink-faint">{item.productCount}</TD>
              <TD>
                <div className="flex items-center justify-end gap-2">
                  <Button href={`/admin/experiences/attractions/${item.id}`} variant="secondary" size="sm">
                    Edit
                  </Button>
                  <a
                    href={`/experiences/attraction/${item.slug}?preview=1`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl border border-stone bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-sm transition hover:bg-cream"
                  >
                    Preview
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                    Delete
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete attraction?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          {deleteTarget ? (
            <>
              This permanently deletes <strong>{deleteTarget.name}</strong>
              {deleteTarget.productCount > 0
                ? `. It currently has ${deleteTarget.productCount} experience${deleteTarget.productCount === 1 ? "" : "s"} assigned — deletion will be blocked until they're reassigned or you unpublish this attraction instead.`
                : ". This can't be undone."}
            </>
          ) : null}
        </p>
      </Modal>
    </>
  );
}
