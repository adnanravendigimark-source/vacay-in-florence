import Image from "next/image";
import Link from "next/link";
import type { BlogPostSummary } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function BlogPostCard({ post, priority = false }: { post: BlogPostSummary; priority?: boolean }) {
  const formattedDate = dateFormatter.format(new Date(post.publishedAt)).toUpperCase();

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200/80 shadow-xs transition-all duration-300 hover:shadow-md hover:border-stone-300"
    >
      {/* Card Thumbnail Image with Floating Badge */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        <Image
          src={post.image.src}
          alt={post.image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-800 shadow-xs backdrop-blur-md">
          {post.category}
        </span>
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Date and Read Time with Clock Icon */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>
            {formattedDate} &bull; {post.readingTimeMinutes} MIN READ
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-2 font-display text-base sm:text-lg font-bold leading-snug text-neutral-900 transition-colors group-hover:text-terracotta line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-neutral-500 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Read More */}
        <div className="mt-auto pt-3.5 flex items-center gap-1 text-xs font-semibold text-neutral-800 transition-colors group-hover:text-terracotta">
          <span>Read More</span>
          <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
        </div>
      </div>
    </Link>
  );
}

