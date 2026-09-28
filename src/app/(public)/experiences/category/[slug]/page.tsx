import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategories, getCategoryBySlug } from "@/lib/data/categories";
import { getStaffContext } from "@/lib/require-user";
import { searchProducts, type ProductSortOption } from "@/lib/data/products";
import { ExperiencesHero } from "@/components/experiences/experiences-hero";
import { ExperienceListing } from "@/components/experiences/experience-listing";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

type Params = { slug: string };
type SearchParams = { sort?: string; page?: string; preview?: string };

// A logged-in staff member visiting `?preview=1` sees the category page
// exactly as it will look once published (draft categories included), so
// "Preview" in the Admin Category Editor works before a category goes
// live. Anyone else always gets the normal status="published" filter
// inside getCategoryBySlug. Mirrors the product page's isStaffPreview.
async function isStaffPreview(searchParams: Promise<SearchParams>): Promise<boolean> {
  const { preview } = await searchParams;
  if (preview !== "1") return false;
  const staff = await getStaffContext();
  return staff !== null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug, { anyStatus: await isStaffPreview(searchParams) });
  if (!category) return {};

  const seoTitle = category.metaTitle || `${category.name} in Florence — Tickets & Experiences`;
  const seoDescription =
    category.metaDescription ||
    `${category.shortDescription} Browse ${category.productCount} ${category.name.toLowerCase()} experiences in Florence with free cancellation.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: category.canonicalUrl || `/experiences/category/${category.slug}` },
    robots:
      category.noIndex || category.noFollow
        ? { index: !category.noIndex, follow: !category.noFollow }
        : undefined,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `/experiences/category/${category.slug}`,
      images: [{ url: category.ogImage || category.image.src }],
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

  const category = await getCategoryBySlug(slug, { anyStatus: await isStaffPreview(searchParams) });
  if (!category) notFound();

  const sort = VALID_SORTS.includes(search.sort as ProductSortOption)
    ? (search.sort as ProductSortOption)
    : "recommended";
  const page = Number.parseInt(search.page ?? "1", 10) || 1;

  const [result, allCategories] = await Promise.all([
    searchProducts({ categorySlug: category.slug, sort, page, pageSize: 10 }),
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
