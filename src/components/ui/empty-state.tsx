import type { ReactNode } from "react";
import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-dark bg-cream-deep/50 px-6 py-16 text-center">
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-cypress ring-1 ring-stone-dark">
          {icon}
        </div>
      ) : null}
      <h2 className="font-display text-xl font-medium text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center rounded-full bg-cypress px-6 py-3 text-sm font-semibold text-white transition hover:bg-cypress/90"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
