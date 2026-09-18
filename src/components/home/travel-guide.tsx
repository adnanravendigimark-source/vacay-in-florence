import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getLatestBlogPosts } from "@/lib/data/blog";

/**
 * Server Component: pulls the 3 latest published blog posts instead of a
 * hardcoded list, so every card links to an article that actually exists
 * at /blog/[slug].
 */

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export async function TravelGuide() {
  const posts = await getLatestBlogPosts(3);

  if (posts.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20 border-t border-neutral-200/70">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column: Title & CTA */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full pr-0 lg:pr-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta mb-3">
                TRAVEL GUIDE &amp; BLOG
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-neutral-900 leading-tight">
                Plan Your Perfect Florence Trip
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-md">
                Travel tips, city guides, hidden gems and more.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#1c352d] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#12241f] hover:shadow-lg hover:scale-[1.02]"
              >
                <span>Explore Blog</span>
                <span className="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Blog Posts Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-stone/60 shadow-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={post.image.src}
                    alt={post.image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {post.readingTimeMinutes} min read
                  </span>
                  <h3 className="mt-1.5 text-xs sm:text-sm font-semibold leading-snug text-neutral-900 group-hover:text-[#1c352d] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <span className="mt-auto pt-3 text-[11px] text-neutral-400">
                    {dateFormatter.format(new Date(post.publishedAt))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
