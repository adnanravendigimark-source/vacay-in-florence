import type { Metadata } from "next";
import { requireSupplier } from "@/lib/require-user";
import { getCategoryOptions, getBlogPostOptions, getAttractionOptions } from "@/lib/data/admin/products";
import { ExperienceEditor } from "@/components/admin/experience-editor";
import type { ProductFormData } from "@/lib/validation/products";
import { DEFAULT_GOOD_TO_KNOW_TIPS } from "@/lib/constants";
import {
  supplierCreateProductAction,
  supplierUpdateProductAction,
  supplierDeleteProductAction,
  supplierGenerateAvailabilityAction,
  supplierUpdateAvailabilityCapacityAction,
  supplierDeleteAvailabilityDateAction,
} from "../actions";

export const metadata: Metadata = {
  title: "New Experience | Supplier",
  robots: { index: false, follow: false },
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

export default async function NewSupplierExperiencePage() {
  const supplier = await requireSupplier("/supplier/experiences/new");
  const [categories, blogPosts, attractions] = await Promise.all([
    getCategoryOptions(),
    getBlogPostOptions(),
    getAttractionOptions(),
  ]);

  return (
    <ExperienceEditor
      mode="create"
      initialValues={{
        ...EMPTY_VALUES,
        categoryId: categories[0]?.id ?? "",
        supplierId: supplier.supplierId,
      }}
      categories={categories}
      attractions={attractions}
      suppliers={[{ id: supplier.supplierId, name: supplier.supplierName }]}
      blogPosts={blogPosts}
      basePath="/supplier/experiences"
      publishLabel="Submit for Review"
      publishStatus="pending_review"
      lockStatusField
      lockSupplierField
      actions={{
        create: supplierCreateProductAction,
        update: supplierUpdateProductAction,
        delete: supplierDeleteProductAction,
        generateAvailability: supplierGenerateAvailabilityAction,
        updateAvailabilityCapacity: supplierUpdateAvailabilityCapacityAction,
        deleteAvailabilityDate: supplierDeleteAvailabilityDateAction,
      }}
    />
  );
}
