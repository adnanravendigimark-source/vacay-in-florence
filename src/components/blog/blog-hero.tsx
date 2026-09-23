import Image from "next/image";
import { Container } from "@/components/ui/container";
import { BlogSearchBox } from "@/components/blog/blog-search-box";
import type { BlogPageContent } from "@/lib/types";

export function BlogHero({
  content,
  initialQuery,
}: {
  content: BlogPageContent;
  initialQuery?: string;
}) {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAF8F5] border-b border-stone-200/80">
      {/* Background Panorama Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/images/hero2-florence-panorama.jpg"
          alt="Panoramic view of Florence and the Duomo"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right md:object-center"
        />
        {/* Soft light gradient mask for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 via-50% to-transparent" />
        {/* Subtle bottom edge softness */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#FAF8F5] to-transparent opacity-80" />
      </div>

      <Container className="relative z-10 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20">
        <div className="max-w-xl">
          {/* Eyebrow — from the 'blog' CMS content block (cms_blocks), not
              hardcoded, so an admin edit here is reflected on the site. */}
          <div className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.22em] text-neutral-500 uppercase mb-3.5">
            {content.eyebrow}
          </div>

          {/* Heading */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-bold text-neutral-900 leading-[1.12] tracking-tight">
            {content.heading}
          </h1>

          {/* Subheading */}
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-neutral-600 max-w-lg">
            {content.subheading}
          </p>

          {/* Search Box */}
          <div className="mt-7 max-w-md">
            <BlogSearchBox placeholder={content.searchPlaceholder} initialQuery={initialQuery} />
          </div>
        </div>
      </Container>
    </section>
  );
}

