import type { Metadata } from "next";
import { getCategoryOptions, getSupplierOptions } from "@/lib/data/admin/products";
import { ExperienceEditor } from "@/components/admin/experience-editor";
import type { ProductFormData } from "@/lib/validation/products";

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
  supplierId: "",
  durationLabel: "",
  badges: [],
  status: "draft",
  featured: false,
  featuredRank: null,
  highlights: [],
  inclusions: [],
  exclusions: [],
  cancellationPolicy: "",
  meetingPoint: null,
  meetingCity: null,
  meetingCountry: null,
  priceFromAmount: 0,
  priceFromCurrency: "EUR",
  options: [],
  images: [],
  videoUrl: null,
  metaTitle: null,
  metaDescription: null,
  canonicalUrl: null,
  ogImage: null,
  noIndex: false,
  noFollow: false,
};

export default async function NewExperiencePage() {
  const [categories, suppliers] = await Promise.all([getCategoryOptions(), getSupplierOptions()]);

  return (
    <ExperienceEditor
      mode="create"
      initialValues={{
        ...EMPTY_VALUES,
        categoryId: categories[0]?.id ?? "",
        supplierId: suppliers[0]?.id ?? "",
      }}
      categories={categories}
      suppliers={suppliers}
    />
  );
}
