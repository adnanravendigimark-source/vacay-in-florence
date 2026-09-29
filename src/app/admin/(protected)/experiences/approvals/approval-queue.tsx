"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Table, THead, TBody, TR, TH, TD, Badge, Button, Modal, Textarea, useToast } from "@/components/admin/ui";
import { approveExperienceAction, rejectExperienceAction, requestExperienceChangesAction } from "./actions";
import type { AdminProductListItem } from "@/lib/data/admin/products";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

type ReviewMode = "reject" | "changes" | null;

export function ApprovalQueueTable({ items: initialItems }: { items: AdminProductListItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; title: string; mode: ReviewMode } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function removeFromQueue(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleApprove(id: string) {
    startTransition(async () => {
      const result = await approveExperienceAction(id);
      if (result.success) {
        showToast("Experience approved and published.", "success");
        removeFromQueue(id);
      } else {
        showToast(result.error ?? "Could not approve this experience.", "error");
      }
    });
  }

  function openReview(id: string, title: string, mode: ReviewMode) {
    setReviewTarget({ id, title, mode });
    setReviewNote("");
  }

  function submitReview() {
    if (!reviewTarget || !reviewNote.trim()) {
      showToast("Add a note explaining the decision before submitting.", "error");
      return;
    }
    const { id, mode } = reviewTarget;
    startTransition(async () => {
      const result =
        mode === "reject" ? await rejectExperienceAction(id, reviewNote.trim()) : await requestExperienceChangesAction(id, reviewNote.trim());
      if (result.success) {
        showToast(mode === "reject" ? "Experience rejected." : "Changes requested.", "success");
        removeFromQueue(id);
        setReviewTarget(null);
      } else {
        showToast(result.error ?? "Could not save this review.", "error");
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#EAE6DF] bg-white p-10 text-center">
        <p className="text-sm text-neutral-500">No experiences are waiting for review.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <THead>
          <TR>
            <TH>Experience</TH>
            <TH>Supplier</TH>
            <TH>Submitted</TH>
            <TH>{""}</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((item) => (
            <TR key={item.id}>
              <TD>
                <Link href={`/admin/experiences/${item.id}`} className="font-medium text-neutral-900 hover:text-cypress hover:underline">
                  {item.title}
                </Link>
                <p className="mt-0.5 text-xs text-neutral-500">{item.categoryName}</p>
              </TD>
              <TD>
                <Badge tone="neutral">{item.supplierName}</Badge>
              </TD>
              <TD>{item.submittedAt ? dateFormatter.format(item.submittedAt) : "—"}</TD>
              <TD>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openReview(item.id, item.title, "changes")} disabled={isPending}>
                    Request changes
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => openReview(item.id, item.title, "reject")} disabled={isPending}>
                    Reject
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleApprove(item.id)} disabled={isPending}>
                    Approve
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Modal
        open={reviewTarget !== null}
        onClose={() => setReviewTarget(null)}
        title={reviewTarget?.mode === "reject" ? "Reject experience" : "Request changes"}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setReviewTarget(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant={reviewTarget?.mode === "reject" ? "danger" : "primary"} size="sm" onClick={submitReview} disabled={isPending}>
              {isPending ? "Saving…" : reviewTarget?.mode === "reject" ? "Reject" : "Send"}
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-ink-faint">
          {reviewTarget?.title} — this note is shown directly to the supplier.
        </p>
        <Textarea
          rows={4}
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder={
            reviewTarget?.mode === "reject"
              ? "Explain why this experience was rejected…"
              : "Explain what needs to change before this can be approved…"
          }
        />
      </Modal>
    </>
  );
}
