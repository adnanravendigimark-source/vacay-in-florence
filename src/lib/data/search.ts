import { searchProductSuggestions, type ProductSuggestion } from "@/lib/data/products";
import { searchCategorySuggestions, getFeaturedCategories, type CategorySuggestion } from "@/lib/data/categories";
import { getFeaturedExperiences } from "@/lib/data/products";
import type { ProductCardSummary } from "@/lib/types";

export interface SearchSuggestionsResult {
  query: string;
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  /** Only populated when `query` is empty — editorially-featured picks
   *  shown before the visitor has typed anything, replacing what used to
   *  be a hard-coded suggestions list. */
  popular: { products: ProductCardSummary[]; categories: CategorySuggestion[] };
}

const MIN_QUERY_LENGTH = 2;

/**
 * Single entry point for the search bar's autocomplete dropdown (see
 * src/app/api/search/route.ts). Two small, indexed, LIMITed queries run
 * in parallel — never the full catalog — so this stays cheap to call on
 * every debounced keystroke.
 */
export async function getSearchSuggestions(rawQuery: string): Promise<SearchSuggestionsResult> {
  const query = rawQuery.trim();

  if (query.length < MIN_QUERY_LENGTH) {
    // Below the minimum length, skip the fuzzy-match queries entirely
    // (a 1-character trigram search is both slow and useless) and show
    // real, DB-driven "popular" picks instead of an empty dropdown.
    const [popularProducts, popularCategories] = await Promise.all([
      getFeaturedExperiences(5),
      getFeaturedCategories(6),
    ]);
    return {
      query,
      products: [],
      categories: [],
      popular: {
        products: popularProducts,
        categories: popularCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, productCount: c.productCount })),
      },
    };
  }

  const [products, categories] = await Promise.all([
    searchProductSuggestions(query, 5),
    searchCategorySuggestions(query, 4),
  ]);

  return { query, products, categories, popular: { products: [], categories: [] } };
}
