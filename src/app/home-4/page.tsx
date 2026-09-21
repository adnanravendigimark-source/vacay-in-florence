import type { Metadata } from "next";
import { Hero4 } from "@/components/home-4/hero-4";
import { CuratedExperiencesV4 } from "@/components/home-4/curated-experiences-v4";
import { LandmarkShowcaseV4 } from "@/components/home-4/landmark-showcase-v4";
import { TuscanEscapesV4 } from "@/components/home-4/tuscan-escapes-v4";
import { CuratedRoutesV4 } from "@/components/home-4/curated-routes-v4";
import { VerifiedReviewsV4 } from "@/components/home-4/verified-reviews-v4";
import { FlorenceFaqV4 } from "@/components/home-4/florence-faq-v4";
import { VipNewsletterV4 } from "@/components/home-4/vip-newsletter-v4";
import { Home4Footer } from "@/components/home-4/home-4-footer";
import { getAllCategories } from "@/lib/data/categories";
import { searchProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Florence, Curated Your Way — VACAY Florence V4",
  description:
    "Discover iconic landmarks, authentic local experiences, and unforgettable tours in Florence — all in one place.",
  alternates: { canonical: "/home-4" },
};

export default async function Home4Page() {
  const [categories, productsResult] = await Promise.all([
    getAllCategories(),
    searchProducts({ pageSize: 50 }),
  ]);

  return (
    <div className="bg-white text-[#18181b] min-h-screen flex flex-col justify-between">
      <main>
        <Hero4 />
        <CuratedExperiencesV4 experiences={productsResult.items} />
        <LandmarkShowcaseV4 />
        <TuscanEscapesV4 />
        <CuratedRoutesV4 />
        <VerifiedReviewsV4 />
        <FlorenceFaqV4 />
        <VipNewsletterV4 />
      </main>
      <Home4Footer />
    </div>
  );
}
