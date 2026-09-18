import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CategoryIconGlyph } from "@/components/ui/category-icon";
import { getAllCategories } from "@/lib/data/categories";

export async function ProductDiscovery() {
  const categories = await getAllCategories();

  return (
    <section aria-label="Quick experience filters" className="border-b border-stone/70 bg-cream">
      <Container className="py-5">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/experiences/category/${category.slug}`}
              className="flex snap-start items-center gap-2 whitespace-nowrap rounded-full border border-stone-dark bg-white px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:border-terracotta hover:text-terracotta"
            >
              <CategoryIconGlyph icon={category.icon} className="h-4 w-4" />
              {category.name}
            </Link>
          ))}
          <Link
            href="/experiences"
            className="flex snap-start items-center whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white"
          >
            View all
          </Link>
        </div>
      </Container>
    </section>
  );
}
