import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedBlogPosts, searchBlogPosts, slugifyCategory } from "@/lib/data/blog";
import { getStaffContext } from "@/lib/require-user";
import { renderBlogBody } from "@/lib/blog/content";
import { resolveRobots, resolveCanonical, resolveOg, buildArticleJsonLd, buildBreadcrumbJsonLd, getSiteUrl } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { QuickAnswer } from "@/components/blog/quick-answer";

export async function generateStaticParams() {
  const { items } = await searchBlogPosts({ pageSize: 100 });
  return items.map((post) => ({ slug: post.slug }));
}

type Params = { slug: string };
type SearchParams = { preview?: string };

// A logged-in staff member visiting `?preview=1` sees the article exactly
// as it will look once published (draft included), so "Preview" in the
// Admin Blog Editor works before an article goes live. Anyone else
// always gets the normal published-only filter inside getBlogPostBySlug.
// Mirrors the product/category detail pages' isStaffPreview.
async function isStaffPreview(searchParams: Promise<SearchParams>): Promise<boolean> {
  const { preview } = await searchParams;
  if (preview !== "1") return false;
  const staff = await getStaffContext();
  return staff !== null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, { anyStatus: await isStaffPreview(searchParams) });
  if (!post) return {};

  const og = resolveOg({ ogImage: post.seo.ogImage }, {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    image: post.image.src,
  });

  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    alternates: { canonical: resolveCanonical(`/blog/${post.slug}`, post.seo.canonicalUrl) },
    robots: resolveRobots(post.seo.noIndex, post.seo.noFollow),
    openGraph: {
      type: "article",
      title: og.title,
      description: og.description,
      url: `/blog/${post.slug}`,
      images: og.image ? [{ url: og.image, alt: post.image.alt }] : undefined,
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: og.title,
      description: og.description,
      images: og.image ? [og.image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, { anyStatus: await isStaffPreview(searchParams) });
  if (!post) notFound();

  const related = await getRelatedBlogPosts(post.slug, post.category, 4);
  const { html: contentHtml, toc: headingToc } = renderBlogBody(post.body);
  const toc = post.quickAnswer.trim()
    ? [{ id: "quick-answer", text: "Quick Answer", level: 2 as const }, ...headingToc]
    : headingToc;

  const siteUrl = getSiteUrl();
  const articleJsonLd = buildArticleJsonLd({
    headline: post.title,
    description: post.seo.metaDescription,
    image: `${siteUrl}${post.image.src}`,
    datePublished: post.publishedAt,
    url: `${siteUrl}/blog/${post.slug}`,
    authorName: post.author,
    siteName: "VACAY Florence",
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Travel Guide", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Container className="pt-6">
        <nav aria-label="Breadcrumb" className="text-xs font-medium text-ink-faint">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-cypress transition-colors">
                Home
              </Link>
            </li>
            <li className="text-stone-dark">/</li>
            <li>
              <Link href="/blog" className="hover:text-cypress transition-colors">
                Travel Guide
              </Link>
            </li>
            <li className="text-stone-dark">/</li>
            <li className="font-semibold text-ink line-clamp-1" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="mt-5">
          <Link
            href={`/blog/category/${slugifyCategory(post.category)}`}
            className="inline-block rounded-md bg-cypress-light px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cypress"
          >
            {post.category}
          </Link>

          <h1 className="mt-3.5 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-3.5 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">{post.excerpt}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-soft">
            <span>
              {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
                new Date(post.publishedAt),
              )}
            </span>
            <span>{post.readingTimeMinutes} min read</span>
            <span className="font-semibold text-ink">By {post.author}</span>
          </div>

          <div className="relative mt-6 aspect-[16/9] sm:aspect-[21/10] w-full overflow-hidden rounded-2xl border border-stone/80 shadow-sm bg-cream-deep">
            <Image
              src={post.image.src}
              alt={post.image.alt}
              fill
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-10 pb-20 lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          <div>
            {post.quickAnswer.trim() && <QuickAnswer>{post.quickAnswer}</QuickAnswer>}

            <div
              className="mt-8 max-w-none text-[17px] leading-relaxed text-ink-soft [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-medium [&_h1]:text-ink [&_h1]:scroll-mt-24 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-ink [&_h2]:scroll-mt-24 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-ink [&_h3]:scroll-mt-24 [&_p]:mb-5 [&_strong]:font-bold [&_strong]:text-ink [&_b]:font-bold [&_b]:text-ink [&_em]:italic [&_u]:underline [&_a]:text-cypress [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-cypress/80 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-cypress/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink [&_img]:my-6 [&_img]:w-full [&_img]:rounded-2xl [&_figure]:my-6 [&_figure]:mb-2 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-ink-faint [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:border [&_table]:border-stone [&_th]:border [&_th]:border-stone [&_th]:bg-cream-deep [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink [&_td]:border [&_td]:border-stone [&_td]:px-3.5 [&_td]:py-2.5"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-stone bg-gradient-to-br from-terracotta-light/60 via-white to-gold-light/40 p-6 text-center sm:flex-row sm:text-left shadow-sm">
              <div>
                <p className="font-display text-base font-bold text-ink">{post.cta.heading}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{post.cta.body}</p>
              </div>
              <Link
                href={post.cta.buttonHref}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-cypress px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-cypress/90"
              >
                {post.cta.buttonText}
              </Link>
            </div>

            {related.length > 0 && (
              <section className="mt-16 border-t border-stone pt-10">
                <h2 className="font-display text-2xl font-medium text-ink">More from the travel guide</h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {related.slice(0, 3).map((p) => (
                    <BlogPostCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="mt-12 lg:mt-0">
            <BlogSidebar
              popularPosts={related}
              toc={toc}
              ctaHeading={post.cta.heading}
              ctaBody={post.cta.body}
              ctaButtonText={post.cta.buttonText}
              ctaButtonHref={post.cta.buttonHref}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
