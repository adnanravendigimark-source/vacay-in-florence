import type { Metadata } from "next";
import { getHomepageContent } from "@/lib/data/homepage";
import { HomepageEditor } from "@/components/admin/homepage-editor";

export const metadata: Metadata = {
  title: "Homepage Editor | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminHomepageEditorPage() {
  const content = await getHomepageContent();

  return <HomepageEditor initialData={content} />;
}
