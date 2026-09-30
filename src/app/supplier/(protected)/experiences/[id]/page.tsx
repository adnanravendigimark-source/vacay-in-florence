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
    itinerary: (product.itinerary || []).map((s) => ({
      time: s.time ?? "",
      title: s.title,
      description: s.description ?? "",
      image: s.image ?? "",
      tag: s.tag ?? "",
      icon: s.icon ?? "",
    })),
    secretHistoryPoints: (product.secretHistoryPoints || []).map((p) => {
      if (typeof p === "object" && p !== null) {
        return {
          title: p.title || "",
          description: p.description || "",
          image: p.image || "",
        };
      }
      return {
        title: String(p || ""),
        description: "",
        image: "",
      };
    }),
    entrances: product.entrances,
    ultimateExperienceTitle: product.ultimateExperienceTitle,
    ultimateExperienceDescription: product.ultimateExperienceDescription,
    ultimateExperiencePoints: (product.ultimateExperiencePoints || []).map((p) => {
      if (typeof p === "object" && p !== null) {
        return {
          title: p.title || "",
          description: p.description || "",
          icon: p.icon || "",
        };
      }
      return {
        title: String(p || ""),
        description: "",
        icon: "",
      };
    }),
    openingHours: product.openingHours,
    operationalInfo: product.operationalInfo,
    gettingThereOptions: (product.gettingThereOptions || []).map((g) => ({
      mode: g.mode,
      description: g.description ?? "",
      image: g.image ?? "",
      tag: g.tag ?? "",
      icon: g.icon ?? "",
    })),
    bestTimeToVisit: product.bestTimeToVisit,
    bestTimeToVisitTips: (product.bestTimeToVisitTips || []).map((t) => {
      if (typeof t === "object" && t !== null) {
        return {
          season: t.season || "",
          months: t.months || t.title || "",
          title: t.title || t.months || "",
          description: t.description || "",
          image: t.image || "",
          icon: t.icon || "",
        };
      }
      return {
        season: "",
        months: "",
        title: "",
        description: String(t || ""),
        image: "",
        icon: "",
      };
    }),
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
