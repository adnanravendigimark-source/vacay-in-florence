export function QuickAnswer({
  children,
  label = "Quick Answer",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div
      id="quick-answer"
      className="mt-6 flex scroll-mt-24 gap-3.5 rounded-2xl border border-gold/40 bg-gold-light/60 p-6 shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-lg">💡</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gold">{label}</p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-ink-soft">{children}</p>
      </div>
    </div>
  );
}
