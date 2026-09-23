import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { searchBlogPosts, getBlogCategories, getBlogCategoryBySlug } from "@/lib/data/blog";
import { getBlogPageContent } from "@/lib/data/site-content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogListing } from "@/components/blog/blog-listing";

export async function generateStaticParams() {
  const categories = await getBlogCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

type Params = { slug: string };
type SearchParams = { page?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.name} — Florence Travel Guide`,
    description: `${category.postCount} article${category.postCount === 1 ? "" : "s"} about ${category.name.toLowerCase()} in Florence.`,
    alternates: { canonical: `/blog/category/${category.slug}` },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const search = await searchParams;

  const category = await getBlogCategoryBySlug(slug);
  if (!category) notFound();

  const page = Number.parseInt(search.page ?? "1", 10) || 1;

  const [result, allCategories, content] = await Promise.all([
    searchBlogPosts({ category: category.name, page, pageSize: 9 }),
    getBlogCategories(),
    getBlogPageContent(),
  ]);

  const jsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Travel Guide", path: "/blog" },
    { name: category.name, path: `/blog/category/${category.slug}` },
  ]);

  return (
    <main className="w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogHero content={content} />
      <BlogListing
        result={result}
        categories={allCategories}
        activeCategorySlug={category.slug}
        currentParams={{}}
        emptyStateTitle={content.emptyStateTitle}
        emptyStateDescription={content.emptyStateDescription}
      />
    </main>
  );
}
