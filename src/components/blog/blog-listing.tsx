"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BlogCategoryPills } from "@/components/blog/blog-category-pills";
import { EmptyState } from "@/components/ui/empty-state";
import { Container } from "@/components/ui/container";
import type { BlogCategorySummary } from "@/lib/types";
import type { SearchBlogPostsResult } from "@/lib/data/blog";

const PAGE_SIZE = 9;

/**
 * Infinite-scroll blog listing, mirroring
 * src/components/experiences/experience-listing.tsx's shape exactly
 * (server-rendered first page + client-side "load more" against a
 * dedicated API route) rather than the Amsterdam reference repo's
 * fetch-everything-then-filter-in-the-browser approach — see the
 * comment on searchBlogPosts() in src/lib/data/blog.ts for why.
 */
export function BlogListing({
  result,
  categories,
  activeCategorySlug,
  currentParams,
  showCategoryFilters = true,
  titleOverride,
  subtitleOverride,
  emptyStateTitle,
  emptyStateDescription,
}: {
  result: SearchBlogPostsResult;
  categories: BlogCategorySummary[];
  activeCategorySlug?: string;
  currentParams: { q?: string };
  showCategoryFilters?: boolean;
  titleOverride?: string;
  subtitleOverride?: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
}) {
  const [prevResult, setPrevResult] = useState(result);
  const [items, setItems] = useState(result.items);
  const [page, setPage] = useState(result.page);
  const [hasMore, setHasMore] = useState(result.page < result.totalPages);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { total } = result;

  if (result !== prevResult) {
    setPrevResult(result);
    setItems(result.items);
    setPage(result.page);
    setHasMore(result.page < result.totalPages);
    setLoadError(false);
  }

  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setLoadError(false);

    const nextPage = page + 1;
    const qs = new URLSearchParams();
    if (currentParams.q) qs.set("q", currentParams.q);
    if (activeCategorySlug) qs.set("category", activeCategorySlug);
    qs.set("page", String(nextPage));
    qs.set("pageSize", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/blog/search?${qs.toString()}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: SearchBlogPostsResult = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setHasMore(data.page < data.totalPages);
    } catch (error) {
      console.error("[BlogListing] failed to load more articles:", error);
      setLoadError(true);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [page, hasMore, currentParams, activeCategorySlug]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const activeCategory = categories.find((category) => category.slug === activeCategorySlug);
  const sectionTitle = titleOverride || (activeCategory ? activeCategory.name : "Latest Articles");
  const sectionSubtitle =
    subtitleOverride ||
    (activeCategory ? `${activeCategory.postCount} article${activeCategory.postCount === 1 ? "" : "s"}` : undefined);

  return (
    <div id="articles" className="w-full bg-white pt-10 sm:pt-14 pb-16 sm:pb-20 scroll-mt-24">
      <Container>
        {showCategoryFilters && categories.length > 0 && (
          <div className="mb-10">
            <BlogCategoryPills categories={categories} activeCategorySlug={activeCategorySlug} />
          </div>
        )}

        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-ink-faint">
                {total} {total === 1 ? "Article" : "Articles"}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-cypress leading-tight">{sectionTitle}</h2>
            {sectionSubtitle && <p className="mt-1.5 text-sm text-ink-soft max-w-xl leading-relaxed">{sectionSubtitle}</p>}
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState title={emptyStateTitle} description={emptyStateDescription} actionLabel="Browse all articles" actionHref="/blog" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((post, index) => (
                <BlogPostCard key={post.id} post={post} priority={index < 3} />
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="mt-12 sm:mt-16 flex items-center justify-center py-4">
                {loadingMore && (
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-ink-faint">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin">
                      <circle cx="12" cy="12" r="9" className="stroke-current opacity-25" strokeWidth="3" fill="none" />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        className="stroke-current"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    Loading more articles…
                  </div>
                )}
                {loadError && !loadingMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    className="text-xs font-semibold text-cypress underline underline-offset-2 hover:text-cypress/80"
                  >
                    Couldn&apos;t load more — tap to retry
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
