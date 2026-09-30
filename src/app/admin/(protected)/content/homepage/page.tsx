import type { Metadata } from "next";
import { getHomepageContent } from "@/lib/data/homepage";
import { listAdminProducts } from "@/lib/data/admin/products";
import { HomepageEditor } from "@/components/admin/homepage-editor";

export const metadata: Metadata = {
  title: "Homepage Editor | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminHomepageEditorPage() {
  const [content, { items: allExperiences }] = await Promise.all([
    getHomepageContent(),
    listAdminProducts({ pageSize: 100 }),
  ]);

  return <HomepageEditor initialData={content} allExperiences={allExperiences} />;
}
