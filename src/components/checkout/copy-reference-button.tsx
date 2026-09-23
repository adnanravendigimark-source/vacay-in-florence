"use client";

import { useState } from "react";

export function CopyReferenceButton({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-700 transition cursor-pointer text-xs font-medium"
      title="Click to copy booking reference"
    >
      <span>Booking Reference</span>
      {copied ? (
        <span className="text-[#a813c9] font-bold text-[11px] ml-1">✓ Copied</span>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-neutral-500 fill-none stroke-current stroke-2">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  );
}
