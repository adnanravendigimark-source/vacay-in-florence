"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Shared smart-search autocomplete logic for the homepage hero
 * (src/components/home/hero-search.tsx) and the /experiences hero
 * (src/components/experiences/experiences-hero.tsx).
 *
 * Both search bars hit the same DB-driven /api/search endpoint with the
 * same debounce/abort/keyboard-nav behavior — this used to be duplicated
 * near-verbatim in both files; extracted here so the two stay in sync
 * and any future fix only needs to happen once.
 */

export interface SuggestionRow {
  kind: "product" | "category";
  id: string;
  href: string;
  title: string;
  meta: string;
}

interface ApiProductSuggestion {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  priceFrom: { amount: number; currency: string };
}

interface ApiCategorySuggestion {
  id: string;
  slug: string;
  name: string;
  productCount: number;
}

interface ApiSearchResponse {
  query: string;
  products: ApiProductSuggestion[];
  categories: ApiCategorySuggestion[];
  popular: { products: ApiProductSuggestion[]; categories: ApiCategorySuggestion[] };
  error?: string;
}

function toProductRow(p: ApiProductSuggestion): SuggestionRow {
  return {
    kind: "product",
    id: p.id,
    href: `/experiences/${p.slug}`,
    title: p.title,
    meta: `${p.categoryName} · from €${Math.round(p.priceFrom.amount)}`,
  };
}

function toCategoryRow(c: ApiCategorySuggestion): SuggestionRow {
  return {
    kind: "category",
    id: c.id,
    href: `/experiences/category/${c.slug}`,
    title: c.name,
    meta: `${c.productCount} experience${c.productCount === 1 ? "" : "s"}`,
  };
}

// Debounce delay for autocomplete requests — short enough to feel live,
// long enough that fast typing doesn't fire a request per keystroke.
const SEARCH_DEBOUNCE_MS = 250;

export type SearchState = "idle" | "loading" | "success" | "empty" | "error";

export function useSearchAutocomplete({
  query,
  active,
  onNavigate,
  onEscape,
}: {
  /** The current text in the search input. */
  query: string;
  /** Whether the search dropdown is currently open (drives the debounced fetch + keyboard nav). */
  active: boolean;
  /** Called with a suggestion's href when it's chosen (click or Enter). */
  onNavigate: (href: string) => void;
  /** Called when Escape is pressed while the dropdown is open. */
  onEscape: () => void;
}) {
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [productResults, setProductResults] = useState<SuggestionRow[]>([]);
  const [categoryResults, setCategoryResults] = useState<SuggestionRow[]>([]);
  const [isPopular, setIsPopular] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearchState("loading");

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Search request failed (${res.status})`);
      const data: ApiSearchResponse = await res.json();

      const usingPopular = q.trim().length < 2;
      const products = usingPopular ? data.popular.products : data.products;
      const categories = usingPopular ? data.popular.categories : data.categories;

      setProductResults(products.map(toProductRow));
      setCategoryResults(categories.map(toCategoryRow));
      setIsPopular(usingPopular);
      setActiveIndex(-1);
      setSearchState(products.length === 0 && categories.length === 0 ? "empty" : "success");
    } catch (error) {
      if ((error as Error).name === "AbortError") return; // superseded by a newer keystroke
      setSearchState("error");
    }
  }, []);

  // Debounced fetch whenever the query changes while the search dropdown
  // is open. Also fires immediately on focus (query === "") to populate
  // the "Popular in Florence" panel from real data.
  useEffect(() => {
    if (!active) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => {
        void runSearch(query);
      },
      query.trim().length === 0 ? 0 : SEARCH_DEBOUNCE_MS,
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, active, runSearch]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const flatResults: SuggestionRow[] = useMemo(
    () => [...productResults, ...categoryResults],
    [productResults, categoryResults],
  );

  const goToSuggestion = useCallback(
    (row: SuggestionRow) => {
      onNavigate(row.href);
    },
    [onNavigate],
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!active || flatResults.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % flatResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        goToSuggestion(flatResults[activeIndex]);
      } else if (e.key === "Escape") {
        onEscape();
      }
    },
    [active, flatResults, activeIndex, goToSuggestion, onEscape],
  );

  return {
    searchState,
    productResults,
    categoryResults,
    isPopular,
    activeIndex,
    setActiveIndex,
    flatResults,
    goToSuggestion,
    handleSearchKeyDown,
    runSearch,
  };
}
