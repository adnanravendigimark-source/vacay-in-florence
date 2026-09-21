import type { Metadata } from "next";
import { HeroV2 } from "@/components/home-2/hero-v2";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
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
  title: "VACAY Florence — Discover Curated Experiences, Tours & Skip-The-Line Tickets",
  description:
    "Explore Florence beyond the crowds with verified entrance tickets, rooftop access, small-group wine tastings, and authentic local experiences.",
  alternates: { canonical: "/home-2" },
};

export default async function Home2Page() {
  const [categories, productsResult] = await Promise.all([
    getAllCategories(),
    searchProducts({ pageSize: 50 }),
  ]);

  return (
    <SmoothScroll>
      <HeroV2 />
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
    </SmoothScroll>
  );
}
