import type { ReactNode } from "react";

// Composable table primitives sharing one card shell (matches the
// `rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-stone/60`
// convention used elsewhere in the app, e.g. account/layout.tsx).
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-stone/60">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-stone bg-cream-deep/40">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-stone">{children}</tbody>;
}

export function TR({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`transition hover:bg-cream-deep/30 ${className}`}>{children}</tr>;
}

export function TH({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-faint ${className}`}>
      {children}
    </th>
  );
}

export function TD({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 align-middle text-ink ${className}`}>{children}</td>;
}
