import type { Metadata } from "next";
import { searchProducts, type ProductSortOption } from "@/lib/data/products";
import { getAllCategories } from "@/lib/data/categories";
import { ExperienceListing } from "@/components/experiences/experience-listing";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Florence Experiences — Tickets, Tours & Day Trips",
  description:
    "Browse every skip-the-line ticket, guided tour, and day trip in Florence. Filter by category, search by name, and book with free cancellation.",
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

  // `dest` is a Florence-neighborhood preset from the homepage search bar
  // (see hero-search.tsx) rather than a separate filter dimension in the
  // catalog — folded into the same free-text search as `q`.
  const combinedQuery = [params.q, params.dest].filter(Boolean).join(" ").trim() || undefined;
  const sort = VALID_SORTS.includes(params.sort as ProductSortOption)
    ? (params.sort as ProductSortOption)
    : "recommended";
  const page = Number.parseInt(params.page ?? "1", 10) || 1;

  const [result, categories] = await Promise.all([
    searchProducts({ q: combinedQuery, date: params.date, sort, page, pageSize: 12 }),
    getAllCategories(),
  ]);

  const heading = params.q
    ? `Results for "${params.q}"`
    : params.dest
      ? `Experiences near ${params.dest}`
      : "All Experiences in Florence";

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">{heading}</h1>
        <p className="mt-2 text-ink-soft">
          Skip-the-line tickets, guided tours, and day trips — every listing has free cancellation up to
          24 hours ahead unless noted otherwise.
        </p>
      </div>

      <ExperienceListing
        basePath="/experiences"
        result={result}
        categories={categories}
        currentParams={{ q: params.q, dest: params.dest, date: params.date, sort: params.sort }}
      />
    </Container>
  );
}
