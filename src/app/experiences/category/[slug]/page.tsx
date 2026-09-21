import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategories, getCategoryBySlug } from "@/lib/data/categories";
import { searchProducts, type ProductSortOption } from "@/lib/data/products";
import { ExperiencesHero } from "@/components/experiences/experiences-hero";
import { ExperienceListing } from "@/components/experiences/experience-listing";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

type Params = { slug: string };
type SearchParams = { sort?: string; page?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.name} in Florence — Tickets & Experiences`,
    description: `${category.shortDescription} Browse ${category.productCount} ${category.name.toLowerCase()} experiences in Florence with free cancellation.`,
    alternates: { canonical: `/experiences/category/${category.slug}` },
    openGraph: {
      title: `${category.name} in Florence`,
      description: category.shortDescription,
      url: `/experiences/category/${category.slug}`,
      images: [{ url: category.image.src }],
    },
  };
}

const VALID_SORTS: ProductSortOption[] = ["recommended", "price-asc", "price-desc", "rating"];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const search = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sort = VALID_SORTS.includes(search.sort as ProductSortOption)
    ? (search.sort as ProductSortOption)
    : "recommended";
  const page = Number.parseInt(search.page ?? "1", 10) || 1;

  const [result, allCategories] = await Promise.all([
    searchProducts({ categorySlug: category.slug, sort, page, pageSize: 8 }),
    getAllCategories(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Experiences", item: "/experiences" },
      { "@type": "ListItem", position: 2, name: category.name, item: `/experiences/category/${category.slug}` },
    ],
  };

  return (
    <main className="w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ExperiencesHero />
      <ExperienceListing
        basePath={`/experiences/category/${category.slug}`}
        result={result}
        categories={allCategories}
        activeCategorySlug={category.slug}
        currentParams={{ sort: search.sort }}
      />
    </main>
  );
}
