import type { Metadata } from "next";
import { searchProducts, type ProductSortOption } from "@/lib/data/products";
import { getAllCategories } from "@/lib/data/categories";
import { ExperiencesHero } from "@/components/experiences/experiences-hero";
import { ExperienceListing } from "@/components/experiences/experience-listing";

export const metadata: Metadata = {
  title: "Experiences in Florence — Skip-the-Line Tickets, Tours & Day Trips",
  description:
    "Skip the lines, explore iconic landmarks, and immerse yourself in the art, culture and beauty of Florence. Browse every skip-the-line ticket, guided tour, and day trip.",
  alternates: { canonical: "/experiences" },
};

type SearchParams = { q?: string; dest?: string; date?: string; sort?: string; page?: string };

const VALID_SORTS: ProductSortOption[] = ["recommended", "price-asc", "price-desc", "rating"];

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const combinedQuery = [params.q, params.dest].filter(Boolean).join(" ").trim() || undefined;
  const sort = VALID_SORTS.includes(params.sort as ProductSortOption)
    ? (params.sort as ProductSortOption)
    : "recommended";
  const page = Number.parseInt(params.page ?? "1", 10) || 1;

  const [result, categories] = await Promise.all([
    searchProducts({ q: combinedQuery, date: params.date, sort, page, pageSize: 8 }),
    getAllCategories(),
  ]);

  const titleOverride = params.q
    ? `Results for "${params.q}"`
    : params.dest
      ? `Experiences near ${params.dest}`
      : undefined;

  return (
    <main className="w-full">
      {/* Golden Sunset Florence Hero Banner */}
      <ExperiencesHero />

      {/* Catalog Listing with Category Filter Ribbon */}
      <ExperienceListing
        basePath="/experiences"
        result={result}
        categories={categories}
        titleOverride={titleOverride}
        currentParams={{ q: params.q, dest: params.dest, date: params.date, sort: params.sort }}
      />
    </main>
  );
}
