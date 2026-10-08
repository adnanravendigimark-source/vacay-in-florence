import type { Metadata } from "next";
import { AttractionEditor } from "@/components/admin/attraction-editor";
import type { AttractionFormData } from "@/lib/validation/attractions";
import { DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS } from "@/lib/attraction-defaults";

export const metadata: Metadata = {
  title: "New Attraction | Admin | VACAY Florence",
  robots: { index: false },
};

const EMPTY_VALUES: AttractionFormData = {
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
  whyChooseItems: DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS,
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

export default function NewAttractionPage() {
  return <AttractionEditor mode="create" initialValues={EMPTY_VALUES} />;
}
