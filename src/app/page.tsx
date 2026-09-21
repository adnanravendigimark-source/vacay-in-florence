import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { QuickCategoryRibbon } from "@/components/home/quick-category-ribbon";
import { InteractiveExperienceExplorer } from "@/components/home/interactive-experience-explorer";
import { LandmarkSpotlight } from "@/components/home/landmark-spotlight";
import { FlorenceItineraryBuilder } from "@/components/home/florence-itinerary-builder";
import { MobileTicketShowcase } from "@/components/home/mobile-ticket-showcase";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { TravelerReviews } from "@/components/home/traveler-reviews";
import { TravelGuide } from "@/components/home/travel-guide";
import { FaqSection } from "@/components/home/faq-section";
import { ConversionVipBanner } from "@/components/home/conversion-vip-banner";
import { getAllCategories } from "@/lib/data/categories";
import { searchProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "VACAY Florence — Skip-the-Line Tickets, Tours & Experiences",
  description:
    "Book skip-the-line tickets, guided tours, and day trips in Florence with instant confirmation, free cancellation, and verified reviews.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "VACAY Florence — Skip-the-Line Tickets, Tours & Experiences",
    description:
      "Book skip-the-line tickets, guided tours, and day trips in Florence with instant confirmation, free cancellation, and verified reviews.",
    url: "/",
  },
};

export default async function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vacayinflorence.com";

  const [categories, productsResult] = await Promise.all([
    getAllCategories(),
    searchProducts({ pageSize: 50 }),
  ]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "VACAY Florence",
      url: siteUrl,
      description: "A curated marketplace for skip-the-line tickets, tours, and day trips in Florence, Italy.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "VACAY Florence",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/experiences?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Florence experience categories",
      itemListElement: categories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: category.name,
        url: `${siteUrl}/experiences/category/${category.slug}`,
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <QuickCategoryRibbon />
      <InteractiveExperienceExplorer experiences={productsResult.items} />
      <LandmarkSpotlight />
      <FlorenceItineraryBuilder />
      <MobileTicketShowcase />
      <WhyChooseUs />
      <TravelerReviews />
      <TravelGuide />
      <FaqSection />
      <ConversionVipBanner />
    </>
  );
}
