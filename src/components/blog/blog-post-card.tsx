import Image from "next/image";
import Link from "next/link";
import type { BlogPostSummary } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export function BlogPostCard({ post, priority = false }: { post: BlogPostSummary; priority?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-stone/60 transition hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-deep">
        <Image
          src={post.image.src}
          alt={post.image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cypress shadow-sm backdrop-blur-md">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {dateFormatter.format(new Date(post.publishedAt))} · {post.readingTimeMinutes} min read
        </p>
        <h3 className="font-display text-lg font-medium leading-snug text-ink line-clamp-2">{post.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
        <p className="mt-auto pt-2 text-xs font-semibold text-terracotta transition group-hover:underline underline-offset-2">
          Read more →
        </p>
      </div>
    </Link>
  );
}
