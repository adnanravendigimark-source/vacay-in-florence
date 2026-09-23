"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Plain text search that navigates to /blog?q=... on submit — no
 * autocomplete dropdown. Contrast with the product catalog's
 * useSearchAutocomplete (src/hooks/use-search-autocomplete.ts): the blog
 * is a handful of articles, not a large catalog, so a live-suggestions
 * API is unwarranted complexity here; this mirrors the simpler search
 * box the Amsterdam reference repo's own blog sidebar uses.
 */
export function BlogSearchBox({
  placeholder = "Search articles...",
  initialQuery = "",
}: {
  placeholder?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(params.toString() ? `/blog?${params.toString()}` : "/blog");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex rounded-xl border border-stone-dark bg-white overflow-hidden shadow-sm focus-within:border-cypress"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
        className="w-full bg-transparent px-4 py-3 text-sm text-ink placeholder-ink-faint focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex items-center justify-center bg-cypress px-4 text-white transition hover:bg-cypress/90"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-2">
          <circle cx="9" cy="9" r="6" />
          <path d="m17 17-4.35-4.35" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
