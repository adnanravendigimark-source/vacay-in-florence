import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedBlogPosts, getBlogPosts } from "@/lib/data/blog";
import { Container } from "@/components/ui/container";

export async function generateStaticParams() {
  const { items } = await getBlogPosts(1, 100);
  return items.map((post) => ({ slug: post.slug }));
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      images: [{ url: post.image.src }],
      publishedTime: post.publishedAt,
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedBlogPosts(post.slug, 3);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vacayinflorence.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `${siteUrl}${post.image.src}`,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "VACAY Florence" },
    publisher: { "@type": "Organization", name: "VACAY Florence" },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative aspect-[21/9] w-full overflow-hidden bg-cream-deep">
        <Image src={post.image.src} alt={post.image.alt} fill priority sizes="100vw" className="object-cover" />
      </div>

      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-faint">
          <Link href="/blog" className="hover:text-ink">
            Travel Guide
          </Link>
        </nav>

        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {dateFormatter.format(new Date(post.publishedAt))} · {post.readingTimeMinutes} min read
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium text-ink sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg text-ink-soft">{post.excerpt}</p>

          <div className="mt-8 space-y-5 text-ink-soft">
            {post.body.split("\n\n").map((para, i) => (
              <p key={i} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {post.tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-cream-deep px-3 py-1 text-xs font-medium text-ink-soft">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {related.length > 0 ? (
          <section className="mx-auto mt-16 max-w-5xl border-t border-stone pt-10">
            <h2 className="font-display text-2xl font-medium text-ink">More from the travel guide</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-stone/60 transition hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-deep">
                    <Image
                      src={p.image.src}
                      alt={p.image.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 90vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="font-display text-base font-medium leading-snug text-ink line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
