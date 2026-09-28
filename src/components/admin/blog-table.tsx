"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteBlogPostAction, setBlogPostStatusAction } from "@/app/admin/(protected)/blog/actions";
import type { AdminBlogListItem, AdminBlogStatus } from "@/lib/data/admin/blog";
import { Table, THead, TBody, TR, TH, TD, Badge, Button, Modal, useToast } from "@/components/admin/ui";

const STATUS_TONE: Record<AdminBlogStatus, "success" | "neutral"> = {
  published: "success",
  draft: "neutral",
};

export function BlogTable({ items }: { items: AdminBlogListItem[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogListItem | null>(null);

  function handleToggleStatus(item: AdminBlogListItem) {
    const next: AdminBlogStatus = item.status === "published" ? "draft" : "published";
    startTransition(async () => {
      const result = await setBlogPostStatusAction(item.id, next, item.slug, item.category);
      if (result.success) {
        showToast(next === "published" ? "Post published." : "Post unpublished.", "success");
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
      const result = await deleteBlogPostAction(target.id, target.slug, target.category);
      if (result.success) {
        showToast("Post deleted.", "success");
        router.refresh();
      } else {
        showToast(result.error ?? "Could not delete this post.", "error");
      }
      setDeleteTarget(null);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <p className="text-sm font-medium text-neutral-700">No articles yet.</p>
        <p className="mt-1 text-xs text-neutral-400">Write your first travel guide article to get started.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <THead>
          <TR>
            <TH>Article</TH>
            <TH>Category</TH>
            <TH>Author</TH>
            <TH>Status</TH>
            <TH>Published</TH>
            <TH className="w-40 text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((item) => (
            <TR key={item.id}>
              <TD>
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                    <Image src={item.coverImageUrl} alt={item.coverImageAlt} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{item.title}</p>
                    <p className="truncate text-xs text-ink-faint">/blog/{item.slug}</p>
                  </div>
                </div>
              </TD>
              <TD className="text-ink-faint">{item.category}</TD>
              <TD className="text-ink-faint">{item.author}</TD>
              <TD>
                <button type="button" onClick={() => handleToggleStatus(item)} disabled={isPending} className="disabled:opacity-50">
                  <Badge tone={STATUS_TONE[item.status]}>{item.status === "published" ? "Published" : "Draft"}</Badge>
                </button>
              </TD>
              <TD className="text-ink-faint">{item.publishedAt ?? "—"}</TD>
              <TD>
                <div className="flex items-center justify-end gap-2">
                  <Button href={`/admin/blog/${item.id}`} variant="secondary" size="sm">
                    Edit
                  </Button>
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
        title="Delete article?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          {deleteTarget ? (
            <>
              This permanently deletes <strong>{deleteTarget.title}</strong>. This can&apos;t be undone.
            </>
          ) : null}
        </p>
      </Modal>
    </>
  );
}
