import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/data/blog";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { buildHref } from "@/lib/url";

export const metadata: Metadata = {
  title: "Florence Travel Guide & Blog",
  description:
    "Itineraries, ticket advice, and day-trip planning for Florence — written to help you plan a trip, not to sell you one specific tour.",
  alternates: { canonical: "/blog" },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number.parseInt(pageParam ?? "1", 10) || 1;
  const { items, totalPages } = await getBlogPosts(page, 9);

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Florence Travel Guide</h1>
        <p className="mt-2 text-ink-soft">
          Practical itineraries, honest ticket advice, and day-trip planning — no sponsored placements.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No articles yet" description="Check back soon — new guides are on the way." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-stone/60 transition hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-deep">
                  <Image
                    src={post.image.src}
                    alt={post.image.alt}
                    fill
                    priority={index < 3}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                    {post.readingTimeMinutes} min read
                  </p>
                  <h2 className="font-display text-lg font-medium leading-snug text-ink">{post.title}</h2>
                  <p className="line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
                  <p className="mt-auto pt-2 text-xs text-ink-faint">{dateFormatter.format(new Date(post.publishedAt))}</p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => buildHref("/blog", {}, { page: p === 1 ? undefined : p })}
          />
        </>
      )}
    </Container>
  );
}
