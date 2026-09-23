"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BlogCategoryPills } from "@/components/blog/blog-category-pills";
import { EmptyState } from "@/components/ui/empty-state";
import { Container } from "@/components/ui/container";
import type { BlogCategorySummary, BlogPostSummary } from "@/lib/types";
import type { SearchBlogPostsResult } from "@/lib/data/blog";

const PAGE_SIZE = 9;

export function BlogListing({
  result,
  categories,
  activeCategorySlug,
  currentParams,
  showCategoryFilters = true,
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

  // Newsletter state
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  // Honest fallback chain: prefer a Duomo/Travel-Tips post if the current
  // page has one, otherwise feature the first real post on the page, and
  // render no Featured Post card at all rather than a fabricated one when
  // there are no real posts to show (e.g. an empty search/category result).
  const featuredPost: BlogPostSummary | null =
    items.find((p) => p.slug.includes("duomo") || p.category === "Travel Tips") ||
    items[0] ||
    null;

  return (
    <div id="articles" className="w-full bg-[#FCFBF9] pb-20 scroll-mt-20">
      {/* Explore by Category Bar */}
      {showCategoryFilters && (
        <Container>
          <BlogCategoryPills
            categories={categories}
            activeCategorySlug={activeCategorySlug}
          />
        </Container>
      )}

      {/* Main Grid + Sidebar Section */}
      <Container className="pt-10">
        {items.length === 0 ? (
          <EmptyState
            title={emptyStateTitle}
            description={emptyStateDescription}
            actionLabel="Browse all articles"
            actionHref="/blog"
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start">
            {/* Left Column: 3-column Article Grid */}
            <div className="flex-1 min-w-0 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((post, index) => (
                  <BlogPostCard key={post.id} post={post} priority={index < 3} />
                ))}
              </div>

              {/* Infinite Scroll Indicator */}
              {hasMore && (
                <div ref={sentinelRef} className="mt-12 flex items-center justify-center py-4">
                  {loadingMore && (
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-500">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin text-terracotta">
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
                      className="text-xs font-semibold text-terracotta underline underline-offset-2 hover:opacity-80"
                    >
                      Couldn&apos;t load more — tap to retry
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Sidebar with Featured Post + Newsletter */}
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6 lg:sticky lg:top-24">
              {/* Featured Post Card — omitted entirely when there's no
                  real post to feature, rather than showing fabricated
                  content (see featuredPost above). */}
              {featuredPost && (
              <div className="rounded-2xl border border-stone-200/90 bg-[#FAF8F5] p-5 shadow-xs transition-all hover:shadow-md">
                <div className="relative mb-2">
                  <span className="font-script text-2xl sm:text-3xl font-normal text-neutral-800 -rotate-1 inline-block">
                    Featured Post
                  </span>
                  <svg
                    className="absolute -bottom-1.5 left-0 w-24 text-terracotta/60 stroke-current"
                    viewBox="0 0 100 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8C20 3 50 3 95 7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <Link href={`/blog/${featuredPost.slug}`} className="group block mt-3">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-100 mb-3.5">
                    <Image
                      src={featuredPost.image.src}
                      alt={featuredPost.image.alt}
                      fill
                      sizes="320px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                    {featuredPost.category}
                  </div>
                  <div className="text-[11px] font-medium text-neutral-400 mt-0.5 uppercase tracking-wider">
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
                      .format(new Date(featuredPost.publishedAt))
                      .toUpperCase()}{" "}
                    &bull; {featuredPost.readingTimeMinutes} MIN READ
                  </div>

                  <h4 className="font-display font-bold text-base text-neutral-900 leading-snug mt-1.5 transition-colors group-hover:text-terracotta line-clamp-2">
                    {featuredPost.title}
                  </h4>

                  <p className="text-xs text-neutral-500 leading-relaxed mt-1.5 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-neutral-900 group-hover:text-terracotta">
                    <span>Read More</span>
                    <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                  </div>
                </Link>
              </div>
              )}

              {/* Newsletter Box */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2B0934] via-[#3D0D4A] to-[#1E0624] p-6 text-white shadow-md">
                {/* Background decorative watermark */}
                <div className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 opacity-10">
                  <svg viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="40" />
                  </svg>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white shadow-inner">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white leading-tight">
                    Get Travel Tips
                    <br />
                    in Your Inbox
                  </h3>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-white/75">
                  Be the first to know about new experiences, blog updates and special offers.
                </p>

                {subscribed ? (
                  <div className="mt-4 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-xs font-semibold text-pink-200">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current text-white">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Thank you for subscribing!</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="relative mt-4">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full rounded-full bg-white px-4 py-2.5 pr-11 text-xs text-neutral-800 placeholder-neutral-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#a813c9]/40"
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe"
                      className="absolute right-1 top-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#a813c9] hover:bg-[#850b9e] text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.5]">
                        <path d="M4 10h11m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}

