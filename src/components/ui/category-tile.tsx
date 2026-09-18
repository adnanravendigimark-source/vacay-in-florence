import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "@/lib/types";

export function CategoryTile({ category }: { category: CategorySummary }) {
  return (
    <Link
      href={`/experiences/category/${category.slug}`}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl ring-1 ring-stone/60"
    >
      <Image
        src={category.image.src}
        alt={category.image.alt}
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        className="object-cover transition duration-300 group-hover:scale-[1.05]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent"
      />
      <div className="relative p-4 text-white">
        <h3 className="font-display text-lg font-medium">{category.name}</h3>
        <p className="text-xs text-white/85">{category.productCount} experiences</p>
      </div>
    </Link>
  );
}
