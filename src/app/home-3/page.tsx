import type { Metadata } from "next";
import { HeroV3 } from "@/components/home-3/hero-v3";
import { QuickCategoriesV3 } from "@/components/home-3/quick-categories-v3";
import { ExperienceExplorerV3 } from "@/components/home-3/experience-explorer-v3";
import { LandmarkSpotlightV3 } from "@/components/home-3/landmark-spotlight-v3";
import { DayTripsV3 } from "@/components/home-3/day-trips-v3";
import { ItineraryBuilderV3 } from "@/components/home-3/itinerary-builder-v3";
import { TrustFeaturesV3 } from "@/components/home-3/trust-features-v3";
import { TravelerReviewsV3 } from "@/components/home-3/traveler-reviews-v3";
import { InsiderGuideV3 } from "@/components/home-3/insider-guide-v3";
import { FaqSectionV3 } from "@/components/home-3/faq-section-v3";
import { VipBannerV3 } from "@/components/home-3/vip-banner-v3";
import { getAllCategories } from "@/lib/data/categories";
import { searchProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "VACAY Florence V3 — Skip-the-Line Tickets, Tours & Experiences",
  description:
    "Book guaranteed priority tickets for Brunelleschi's Duomo, the Uffizi Gallery, and Chianti wine tours with instant confirmation and 100% free cancellation.",
  alternates: { canonical: "/home-3" },
};

export default async function Home3Page() {
  const [categories, productsResult] = await Promise.all([
    getAllCategories(),
    searchProducts({ pageSize: 50 }),
  ]);

  return (
    <main className="bg-[#faf9f6] text-[#18181b] selection:bg-[#c85a32] selection:text-white">
      <HeroV3 />
      <QuickCategoriesV3 />
      <ExperienceExplorerV3 experiences={productsResult.items} />
      <LandmarkSpotlightV3 />
      <DayTripsV3 />
      <ItineraryBuilderV3 />
      <TrustFeaturesV3 />
      <TravelerReviewsV3 />
      <InsiderGuideV3 />
      <FaqSectionV3 />
      <VipBannerV3 />
    </main>
  );
}
