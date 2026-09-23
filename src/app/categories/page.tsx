import type { Metadata } from "next";
import { getAllCategories } from "@/lib/data/categories";
import { CategoriesHero } from "@/components/categories/categories-hero";
import { CategoryBrowseSection } from "@/components/categories/category-browse-section";

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

      {/* Redesigned Category Browse Section: Sub-nav Circles + Header + Filter Pills + 8 Cards Grid + Bottom CTA Banner */}
      <CategoryBrowseSection categories={categories} />
    </main>
  );
}
