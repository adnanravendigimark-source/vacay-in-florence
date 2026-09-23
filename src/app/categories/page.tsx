import type { Metadata } from "next";
import { getAllCategories } from "@/lib/data/categories";
import { CategoriesHero } from "@/components/categories/categories-hero";
import { CategoryCardShowcase } from "@/components/categories/category-card-showcase";
import { TravelStyleGuide } from "@/components/categories/travel-style-guide";
import { FlorenceCtaBanner } from "@/components/experiences/florence-cta-banner";

export const metadata: Metadata = {
  title: "Experience Categories in Florence — Skip-the-Line, Museums, Food & Day Trips",
  description:
    "Explore Florence by category. Discover curated skip-the-line tickets, Renaissance museum passes, Chianti food and wine tours, and scenic Tuscan countryside day trips.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Florence Experience Categories | VACAY Florence",
    description:
      "Explore curated Florence experiences organized by passion: Skip-the-Line Attractions, Museums & Art, Guided Walking Tours, Food & Wine, and Tuscan Day Trips.",
    url: "/categories",
    images: [{ url: "/images/hero-florence-duomo.jpg" }],
  },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Categories", item: "/categories" },
    ],
  };

  return (
    <main className="w-full bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Editorial Luxury Header & Quick Jump Bar */}
      <CategoriesHero categories={categories} />

      {/* In-Depth Category Showcase Cards */}
      <CategoryCardShowcase categories={categories} />

      {/* Travel Style Recommendations */}
      <TravelStyleGuide />

      {/* Local Concierge Assistance Banner */}
      <div className="bg-[#FAF8F5] pb-12">
        <FlorenceCtaBanner
          primaryLabel="Browse All Experiences"
          primaryHref="/experiences"
        />
      </div>
    </main>
  );
}
