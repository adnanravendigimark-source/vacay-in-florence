import type { Metadata } from "next";
import { getAboutPageContent } from "@/lib/data/site-content";
import { AboutPageEditor } from "@/components/admin/about-page-editor";

export const metadata: Metadata = {
  title: "About Us Editor | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminAboutEditorPage() {
  const content = await getAboutPageContent();
  return <AboutPageEditor initialData={content} />;
}
