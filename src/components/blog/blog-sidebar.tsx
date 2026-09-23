import Link from "next/link";
import Image from "next/image";
import { BlogSearchBox } from "@/components/blog/blog-search-box";
import { TableOfContents } from "@/components/blog/table-of-contents";
import type { BlogPostSummary } from "@/lib/types";
import type { TocItem } from "@/lib/blog/content";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function BlogSidebar({
  popularPosts,
  toc,
  ctaHeading,
  ctaBody,
  ctaButtonText,
  ctaButtonHref,
}: {
  popularPosts: BlogPostSummary[];
  toc: TocItem[];
  ctaHeading: string;
  ctaBody: string;
  ctaButtonText: string;
  ctaButtonHref: string;
}) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <BlogSearchBox />

      <TableOfContents items={toc} />

      {popularPosts.length > 0 && (
        <div className="rounded-2xl border border-stone bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-ink">More Articles</p>
          <div className="mt-4 space-y-3.5">
            {popularPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex items-center gap-3">
                <div className="relative h-13 w-16 shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-cream-deep">
                  <Image
                    src={post.image.src}
                    alt={post.image.alt}
                    fill
                    sizes="80px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-bold leading-snug text-ink transition-colors group-hover:text-terracotta">
                    {post.title}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-faint font-medium">
                    {dateFormatter.format(new Date(post.publishedAt))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-stone bg-gradient-to-br from-terracotta-light/70 via-white to-gold-light/50 p-6 text-center shadow-[var(--shadow-card)]">
        <p className="font-display text-base font-bold text-ink">{ctaHeading}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{ctaBody}</p>
        <Link
          href={ctaButtonHref}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-cypress px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-cypress/90"
        >
          {ctaButtonText}
        </Link>
      </div>
    </aside>
  );
}
