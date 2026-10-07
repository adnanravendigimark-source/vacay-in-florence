import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdminProductById,
  getCategoryOptions,
  getSupplierOptions,
  getBlogPostOptions,
  getAttractionOptions,
  getAdminProductAvailability,
} from "@/lib/data/admin/products";
import { ExperienceEditor } from "@/components/admin/experience-editor";
import type { ProductFormData } from "@/lib/validation/products";
import { DEFAULT_GOOD_TO_KNOW_TIPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Edit Experience | Admin | VACAY Florence",
  robots: { index: false },
};

type Params = { id: string };

export default async function EditExperiencePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const [product, categories, suppliers, blogPosts, attractions] = await Promise.all([
    getAdminProductById(id),
    getCategoryOptions(),
    getSupplierOptions(),
    getBlogPostOptions(),
    getAttractionOptions(),
  ]);
  if (!product) notFound();

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
    attractionId: product.attractionId ?? "",
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
    ultimateExperienceImage: product.ultimateExperienceImage,
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
    <ExperienceEditor
      mode="edit"
      productId={id}
      initialValues={initialValues}
      initialAvailability={availability}
      categories={categories}
      attractions={attractions}
      suppliers={suppliers}
      blogPosts={blogPosts}
      listPath="/admin/experiences/tickets"
    />
  );
}
