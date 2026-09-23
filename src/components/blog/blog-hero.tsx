import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BlogSearchBox } from "@/components/blog/blog-search-box";
import type { BlogPageContent } from "@/lib/types";

export function BlogHero({ content, initialQuery }: { content: BlogPageContent; initialQuery?: string }) {
  return (
    <section className="relative w-full bg-[#FAF8F5] pt-12 sm:pt-16 pb-10 sm:pb-14 border-b border-stone-dark/60 overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-light/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-cypress-light/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container className="relative z-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-faint">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-ink transition-colors">
                Home
              </Link>
            </li>
            <li className="text-stone-dark">/</li>
            <li className="font-semibold text-ink">Travel Guide</li>
          </ol>
        </nav>

        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.22em] text-ink-soft uppercase mb-3">
            <span>{content.eyebrow}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-cypress">
            {content.heading}
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-soft max-w-xl">{content.subheading}</p>
        </div>

        <div className="mt-8 max-w-md">
          <BlogSearchBox placeholder={content.searchPlaceholder} initialQuery={initialQuery} />
        </div>
      </Container>
    </section>
  );
}
