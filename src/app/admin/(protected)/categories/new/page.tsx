import type { Metadata } from "next";
import { CategoryEditor } from "@/components/admin/category-editor";
import type { CategoryFormData } from "@/lib/validation/categories";

export const metadata: Metadata = {
  title: "New Category | Admin | VACAY Florence",
  robots: { index: false },
};

const EMPTY_VALUES: CategoryFormData = {
  name: "",
  slug: "",
  shortDescription: "",
  icon: "landmark",
  status: "draft",
  featured: false,
  sortOrder: 0,
  highlights: [],
  badgeText: null,
  ctaLabel: null,
  ctaHref: null,
  imageUrl: "",
  imageAlt: "",
  heroImageUrl: null,
  heroImageAlt: null,
  metaTitle: null,
  metaDescription: null,
  canonicalUrl: null,
  ogImage: null,
  noIndex: false,
  noFollow: false,
};

export default function NewCategoryPage() {
  return <CategoryEditor mode="create" initialValues={EMPTY_VALUES} />;
}
