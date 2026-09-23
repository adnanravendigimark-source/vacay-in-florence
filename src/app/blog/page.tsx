import type { Metadata } from "next";
import { searchBlogPosts, getBlogCategories } from "@/lib/data/blog";
import { getBlogPageContent } from "@/lib/data/site-content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogListing } from "@/components/blog/blog-listing";

export const metadata: Metadata = {
  title: "Florence Travel Guide & Blog",
  description:
    "Itineraries, ticket advice, and day-trip planning for Florence — written to help you plan a trip, not to sell you one specific tour.",
  alternates: { canonical: "/blog" },
};

type SearchParams = { q?: string; page?: string };

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10) || 1;
  const q = params.q?.trim() || undefined;

  const [result, categories, content] = await Promise.all([
    searchBlogPosts({ q, page, pageSize: 9 }),
    getBlogCategories(),
    getBlogPageContent(),
  ]);

  const jsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Travel Guide", path: "/blog" },
  ]);

  const titleOverride = q ? `Results for "${q}"` : undefined;

  return (
    <main className="w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogHero content={content} initialQuery={q} />
      <BlogListing
        result={result}
        categories={categories}
        currentParams={{ q }}
        titleOverride={titleOverride}
        emptyStateTitle={content.emptyStateTitle}
        emptyStateDescription={content.emptyStateDescription}
      />
    </main>
  );
}
