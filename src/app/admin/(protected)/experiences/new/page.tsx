import type { Metadata } from "next";
import { getCategoryOptions, getSupplierOptions, getBlogPostOptions, getAttractionOptions } from "@/lib/data/admin/products";
import { ExperienceEditor } from "@/components/admin/experience-editor";
import type { ProductFormData } from "@/lib/validation/products";
import { DEFAULT_GOOD_TO_KNOW_TIPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "New Experience | Admin | VACAY Florence",
  robots: { index: false },
};

const EMPTY_VALUES: ProductFormData = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  attractionId: "",
  supplierId: "",
  durationLabel: "",
  badges: [],
  status: "draft",
  featured: false,
  featuredRank: null,
  highlights: [],
  inclusions: [],
  exclusions: [],
  goodToKnow: DEFAULT_GOOD_TO_KNOW_TIPS,
  whyVisit: null,
  itinerary: [],
  secretHistoryPoints: [],
  entrances: [],
  ultimateExperienceTitle: null,
  ultimateExperienceDescription: null,
  ultimateExperienceImage: null,
  ultimateExperiencePoints: [],
  openingHours: [],
  operationalInfo: null,
  gettingThereOptions: [],
  bestTimeToVisit: null,
  bestTimeToVisitTips: [],
  faqs: [],
  relatedBlogSlugs: [],
  ctaHeadline: null,
  ctaSubtext: null,
  cancellationPolicy: "",
  meetingPoint: null,
  meetingCity: null,
  meetingCountry: null,
  priceFromAmount: 0,
  priceFromCurrency: "EUR",
  options: [],
  images: [],
  videoUrl: null,
  timeSlots: [],
  metaTitle: null,
  metaDescription: null,
  canonicalUrl: null,
  ogImage: null,
  noIndex: false,
  noFollow: false,
};

export default async function NewExperiencePage() {
  const [categories, suppliers, blogPosts, attractions] = await Promise.all([
    getCategoryOptions(),
    getSupplierOptions(),
    getBlogPostOptions(),
    getAttractionOptions(),
  ]);

  return (
    <ExperienceEditor
      mode="create"
      initialValues={{
        ...EMPTY_VALUES,
        categoryId: categories[0]?.id ?? "",
        supplierId: suppliers[0]?.id ?? "",
      }}
      categories={categories}
      attractions={attractions}
      suppliers={suppliers}
      blogPosts={blogPosts}
    />
  );
}
