"use client";

import { useEffect, type ReactNode } from "react";

// Generic modal shell for the admin panel — same overlay conventions as
// the public site's auth-modal.tsx (fixed inset-0 backdrop-blur-sm
// backdrop, rounded-3xl shadow-2xl panel) and the cart remove-confirm
// dialog, so every "are you sure?" / form-in-a-modal in the app looks
// and behaves the same way. Controlled: the caller owns `open` state.
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  closeOnBackdrop = true,
  maxWidthClassName = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  maxWidthClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full ${maxWidthClassName} overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-2xl animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-faint transition hover:bg-cream-deep hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2]">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-neutral-100 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
