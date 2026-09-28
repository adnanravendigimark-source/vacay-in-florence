"use client";

import { useState } from "react";
import { Field, Input, Button, Modal } from "@/components/admin/ui";

export interface RichLinkModalResult {
  url: string;
  nofollow: boolean;
  newTab: boolean;
}

// The link-insert dialog for RichTextEditor's "Link" toolbar button —
// a real URL field plus a "No follow" checkbox (adds rel="nofollow" so
// search engines don't pass ranking credit through the link — useful for
// sponsored/affiliate links) and an open-in-new-tab choice (adds
// target="_blank" plus the rel="noopener noreferrer" that should always
// accompany it). Mirrors the Amsterdam reference repo's RichLinkModal.
export function RichLinkModal({
  onInsert,
  onClose,
}: {
  onInsert: (result: RichLinkModalResult) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [nofollow, setNofollow] = useState(false);
  const [newTab, setNewTab] = useState(false);

  function handleInsert() {
    if (!url.trim()) return;
    onInsert({ url: url.trim(), nofollow, newTab });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Insert link"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!url.trim()}>
            Insert link
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="URL" hint='Paste a full address, or a relative path like "/blog/other-post". "https://" is added automatically if you leave it off.'>
          <Input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleInsert();
              }
            }}
            placeholder="example.com or /blog/other-post"
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Open link in</span>
          <div className="flex gap-4 text-sm text-ink-soft">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="link-target" checked={!newTab} onChange={() => setNewTab(false)} className="h-4 w-4 border-neutral-300" />
              Same tab
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="link-target" checked={newTab} onChange={() => setNewTab(true)} className="h-4 w-4 border-neutral-300" />
              New tab
            </label>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={nofollow}
            onChange={(e) => setNofollow(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300"
          />
          <span>
            No follow
            <span className="block text-xs text-ink-faint">
              Adds rel=&quot;nofollow&quot; — tells search engines not to pass ranking credit through this link.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}
