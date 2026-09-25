import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdminProductById,
  getCategoryOptions,
  getSupplierOptions,
  getAdminProductAvailability,
} from "@/lib/data/admin/products";
import { ExperienceEditor } from "@/components/admin/experience-editor";
import type { ProductFormData } from "@/lib/validation/products";

export const metadata: Metadata = {
  title: "Edit Experience | Admin | VACAY Florence",
  robots: { index: false },
};

type Params = { id: string };

export default async function EditExperiencePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const [product, categories, suppliers] = await Promise.all([
    getAdminProductById(id),
    getCategoryOptions(),
    getSupplierOptions(),
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
    supplierId: product.supplierId,
    durationLabel: product.durationLabel,
    badges: product.badges,
    status: product.status,
    featured: product.featured,
    featuredRank: product.featuredRank,
    highlights: product.highlights,
    inclusions: product.inclusions,
    exclusions: product.exclusions,
    cancellationPolicy: product.cancellationPolicy,
    meetingPoint: product.meetingPoint,
    meetingCity: product.meetingCity,
    meetingCountry: product.meetingCountry,
    priceFromAmount: product.priceFromAmount,
    priceFromCurrency: product.priceFromCurrency,
    options: product.options.map((o) => ({ ...o, description: o.description ?? undefined })),
    images: product.images.map(({ url, alt }) => ({ url, alt })),
    videoUrl: product.videoUrl,
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
      suppliers={suppliers}
    />
  );
}
