import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  // Always display pages 1 through Math.min(5, Math.max(totalPages, 5)) or totalPages
  const displayPages = Array.from({ length: Math.min(Math.max(totalPages, 1), 5) }, (_, i) => i + 1);

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {/* Prev Arrow */}
      <Link
        href={prevDisabled ? "#" : buildHref(page - 1)}
        aria-disabled={prevDisabled}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors ${
          prevDisabled ? "pointer-events-none opacity-30" : "hover:bg-neutral-100 hover:text-neutral-900"
        }`}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
          <path d="M16 10H4M9 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Page Numbers */}
      {displayPages.map((p) => {
        const isActive = p === page;
        return (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#132319] text-white shadow-sm"
                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            {p}
          </Link>
        );
      })}

      {/* Next Arrow */}
      <Link
        href={nextDisabled ? "#" : buildHref(page + 1)}
        aria-disabled={nextDisabled}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors ${
          nextDisabled ? "pointer-events-none opacity-30" : "hover:bg-neutral-100 hover:text-neutral-900"
        }`}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
          <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </nav>
  );
}
