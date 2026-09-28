import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminCategoryById } from "@/lib/data/admin/categories";
import { CategoryEditor } from "@/components/admin/category-editor";
import type { CategoryFormData } from "@/lib/validation/categories";

export const metadata: Metadata = {
  title: "Edit Category | Admin | VACAY Florence",
  robots: { index: false },
};

type Params = { id: string };

export default async function EditCategoryPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);
  if (!category) notFound();

  const initialValues: CategoryFormData = {
    name: category.name,
    slug: category.slug,
    shortDescription: category.shortDescription,
    icon: category.icon,
    status: category.status,
    featured: category.featured,
    sortOrder: category.sortOrder,
    highlights: category.highlights,
    badgeText: category.badgeText,
    ctaLabel: category.ctaLabel,
    ctaHref: category.ctaHref,
    imageUrl: category.imageUrl,
    imageAlt: category.imageAlt,
    heroImageUrl: category.heroImageUrl,
    heroImageAlt: category.heroImageAlt,
    metaTitle: category.metaTitle,
    metaDescription: category.metaDescription,
    canonicalUrl: category.canonicalUrl,
    ogImage: category.ogImage,
    noIndex: category.noIndex,
    noFollow: category.noFollow,
  };

  return (
    <CategoryEditor mode="edit" categoryId={id} initialValues={initialValues} productCount={category.productCount} />
  );
}
