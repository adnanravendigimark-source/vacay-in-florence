import Link from "next/link";

/**
 * Plain server-rendered pagination — no client JS. `buildHref` receives
 * the target page number and returns the full href (query params
 * preserved by the caller), so this component stays generic across
 * every paginated listing (experiences, category pages, blog).
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  // Keep the page-number list short: current page +/- 2, plus first/last.
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let p = page - 2; p <= page + 2; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <Link
        href={prevDisabled ? "#" : buildHref(page - 1)}
        aria-disabled={prevDisabled}
        className={
          "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition " +
          (prevDisabled
            ? "pointer-events-none text-ink-faint/50"
            : "text-ink-soft ring-1 ring-stone-dark hover:bg-cream-deep")
        }
      >
        Previous
      </Link>

      {sorted.map((p, i) => {
        const prev = sorted[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis ? <span className="px-1 text-ink-faint">&hellip;</span> : null}
            <Link
              href={buildHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                "inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition " +
                (p === page ? "bg-cypress text-white" : "text-ink-soft hover:bg-cream-deep")
              }
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        href={nextDisabled ? "#" : buildHref(page + 1)}
        aria-disabled={nextDisabled}
        className={
          "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition " +
          (nextDisabled
            ? "pointer-events-none text-ink-faint/50"
            : "text-ink-soft ring-1 ring-stone-dark hover:bg-cream-deep")
        }
      >
        Next
      </Link>
    </nav>
  );
}
