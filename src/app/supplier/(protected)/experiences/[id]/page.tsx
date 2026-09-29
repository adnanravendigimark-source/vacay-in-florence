import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSupplier } from "@/lib/require-user";
import { getAdminProductById, getCategoryOptions, getAdminProductAvailability } from "@/lib/data/admin/products";
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
  title: "Edit Experience | Supplier",
  robots: { index: false, follow: false },
};

type Params = { id: string };

export default async function EditSupplierExperiencePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const supplier = await requireSupplier(`/supplier/experiences/${id}`);

  const [product, categories] = await Promise.all([getAdminProductById(id), getCategoryOptions()]);
  if (!product) notFound();
  // Ownership boundary for reads: a supplier can never open another
  // supplier's experience by guessing its id, not even to view it.
  if (product.supplierId !== supplier.supplierId) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const far = new Date();
  far.setDate(far.getDate() + 400);
  const availability = await getAdminProductAvailability(id, today, far.toISOString().slice(0, 10));

  const initialValues: ProductFormData = {
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    categoryId: product.categoryId,
    supplierId: product.supplierId,
    durationLabel: product.durationLabel,
    badges: product.badges,
    status: product.status,
    featured: product.featured,
    featuredRank: product.featuredRank,
    highlights: product.highlights,
    inclusions: product.inclusions,
    exclusions: product.exclusions,
    goodToKnow: product.goodToKnow.length > 0 ? product.goodToKnow : DEFAULT_GOOD_TO_KNOW_TIPS,
    whyVisit: product.whyVisit,
    itinerary: product.itinerary,
    secretHistoryPoints: product.secretHistoryPoints,
    entrances: product.entrances,
    ultimateExperienceTitle: product.ultimateExperienceTitle,
    ultimateExperienceDescription: product.ultimateExperienceDescription,
    ultimateExperiencePoints: product.ultimateExperiencePoints,
    openingHours: product.openingHours,
    operationalInfo: product.operationalInfo,
    gettingThereOptions: product.gettingThereOptions,
    bestTimeToVisit: product.bestTimeToVisit,
    bestTimeToVisitTips: product.bestTimeToVisitTips,
    faqs: product.faqs,
    relatedBlogSlugs: product.relatedBlogSlugs,
    ctaHeadline: product.ctaHeadline,
    ctaSubtext: product.ctaSubtext,
    cancellationPolicy: product.cancellationPolicy,
    meetingPoint: product.meetingPoint,
    meetingCity: product.meetingCity,
    meetingCountry: product.meetingCountry,
    priceFromAmount: product.priceFromAmount,
    priceFromCurrency: product.priceFromCurrency,
    options: product.options.map((o) => ({ ...o, description: o.description ?? undefined })),
    images: product.images.map(({ url, alt }) => ({ url, alt })),
    videoUrl: product.videoUrl,
    timeSlots: product.timeSlots,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    canonicalUrl: product.canonicalUrl,
    ogImage: product.ogImage,
    noIndex: product.noIndex,
    noFollow: product.noFollow,
  };

  return (
    <div className="space-y-4">
      {product.reviewNote && (product.status === "rejected" || product.status === "changes_requested") ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Admin feedback</p>
          <p className="mt-0.5">{product.reviewNote}</p>
        </div>
      ) : null}
      <ExperienceEditor
        mode="edit"
        productId={id}
        initialValues={initialValues}
        initialAvailability={availability}
        categories={categories}
        suppliers={[{ id: supplier.supplierId, name: supplier.supplierName }]}
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
    </div>
  );
}
