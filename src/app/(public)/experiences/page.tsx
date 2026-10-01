import type { Metadata } from "next";
import { searchProducts, type ProductSortOption } from "@/lib/data/products";
import { getAllAttractions } from "@/lib/data/attractions";
import { ExperiencesHero } from "@/components/experiences/experiences-hero";
import { ExperienceListing } from "@/components/experiences/experience-listing";
import { BrowseExperiencesView } from "@/components/experiences/browse-experiences-view";

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
  const isSearchMode = Boolean(params.q || params.dest || params.date);

  const jsonLdBase = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Experiences", item: "/experiences" },
    ],
  };

  if (!isSearchMode) {
    const attractions = await getAllAttractions();

    return (
      <main className="w-full bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBase) }} />
        <ExperiencesHero />
        <BrowseExperiencesView attractions={attractions} />
      </main>
    );
  }

  // --- Search results behavior below ---
  const combinedQuery = [params.q, params.dest].filter(Boolean).join(" ").trim() || undefined;
  const sort = VALID_SORTS.includes(params.sort as ProductSortOption)
    ? (params.sort as ProductSortOption)
    : "recommended";
  const page = Number.parseInt(params.page ?? "1", 10) || 1;

  const result = await searchProducts({ q: combinedQuery, date: params.date, sort, page, pageSize: 10 });

  const titleOverride = params.q
    ? `Results for "${params.q}"`
    : params.dest
      ? `Experiences near ${params.dest}`
      : undefined;

  return (
    <main className="w-full bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBase) }} />
      <ExperiencesHero />

      <ExperienceListing
        basePath="/experiences"
        result={result}
        titleOverride={titleOverride}
        currentParams={{ q: params.q, dest: params.dest, date: params.date, sort: params.sort }}
      />
    </main>
  );
}
