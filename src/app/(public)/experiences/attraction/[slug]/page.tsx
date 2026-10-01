import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllAttractions, getAttractionBySlug } from "@/lib/data/attractions";
import { getStaffContext } from "@/lib/require-user";
import { getProductsByAttractionSlug } from "@/lib/data/products";
import { AttractionHubView } from "@/components/experiences/attraction-hub-view";

export async function generateStaticParams() {
  const attractions = await getAllAttractions();
  return attractions.map((attraction) => ({ slug: attraction.slug }));
}

type Params = { slug: string };
type SearchParams = { preview?: string };

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
  const attraction = await getAttractionBySlug(slug, { anyStatus: await isStaffPreview(searchParams) });
  if (!attraction) return {};

  const seoTitle = attraction.metaTitle || `${attraction.name} Tickets & Tours — Florence`;
  const seoDescription =
    attraction.metaDescription ||
    `${attraction.shortDescription} Browse ${attraction.productCount} ${attraction.name.toLowerCase()} ticket${
      attraction.productCount === 1 ? "" : "s"
    } and tours in Florence with free cancellation.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: attraction.canonicalUrl || `/experiences/attraction/${attraction.slug}` },
    robots:
      attraction.noIndex || attraction.noFollow
        ? { index: !attraction.noIndex, follow: !attraction.noFollow }
        : undefined,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `/experiences/attraction/${attraction.slug}`,
      images: [{ url: attraction.ogImage || attraction.image.src }],
    },
  };
}

export default async function AttractionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;

  const attraction = await getAttractionBySlug(slug, { anyStatus: await isStaffPreview(searchParams) });
  if (!attraction) notFound();

  const tickets = await getProductsByAttractionSlug(attraction.slug);

  // Honestly-computed rating aggregate across this landmark's own tickets
  const rated = tickets.filter((t) => t.ratingAverage !== null && t.reviewCount > 0);
  const totalReviews = rated.reduce((sum, t) => sum + t.reviewCount, 0);
  const weightedRating =
    totalReviews > 0
      ? rated.reduce((sum, t) => sum + (t.ratingAverage as number) * t.reviewCount, 0) / totalReviews
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Experiences", item: "/experiences" },
      { "@type": "ListItem", position: 2, name: attraction.name, item: `/experiences/attraction/${attraction.slug}` },
    ],
  };

  return (
    <main className="w-full bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AttractionHubView
        attraction={attraction}
        tickets={tickets}
        weightedRating={weightedRating}
        totalReviews={totalReviews}
      />
    </main>
  );
}


