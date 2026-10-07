import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminAttractionById } from "@/lib/data/admin/attractions";
import { listAttractionProducts, listAdminProducts } from "@/lib/data/admin/products";
import { AttractionEditor } from "@/components/admin/attraction-editor";
import type { AttractionFormData } from "@/lib/validation/attractions";

export const metadata: Metadata = {
  title: "Edit Attraction | Admin | VACAY Florence",
  robots: { index: false },
};

type Params = { id: string };

export default async function EditAttractionPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const [attraction, assignedProducts, unassignedResult] = await Promise.all([
    getAdminAttractionById(id),
    listAttractionProducts(id),
    listAdminProducts({ attractionId: "unassigned", pageSize: 100, status: "all" }),
  ]);
  if (!attraction) notFound();

  const initialValues: AttractionFormData = {
    name: attraction.name,
    slug: attraction.slug,
    shortDescription: attraction.shortDescription,
    icon: attraction.icon,
    status: attraction.status,
    featured: attraction.featured,
    sortOrder: attraction.sortOrder,
    highlights: attraction.highlights,
    badgeText: attraction.badgeText,
    ctaLabel: attraction.ctaLabel,
    ctaHref: attraction.ctaHref,
    imageUrl: attraction.imageUrl,
    imageAlt: attraction.imageAlt,
    heroImageUrl: attraction.heroImageUrl,
    heroImageAlt: attraction.heroImageAlt,
    metaTitle: attraction.metaTitle,
    metaDescription: attraction.metaDescription,
    canonicalUrl: attraction.canonicalUrl,
    ogImage: attraction.ogImage,
    noIndex: attraction.noIndex,
    noFollow: attraction.noFollow,
  };

  return (
    <AttractionEditor
      mode="edit"
      attractionId={id}
      initialValues={initialValues}
      productCount={attraction.productCount}
      assignedProducts={assignedProducts}
      unassignedProducts={unassignedResult.items}
    />
  );
}
