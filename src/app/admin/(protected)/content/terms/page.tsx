import type { Metadata } from "next";
import { getLegalPageContent } from "@/lib/data/site-content";
import { LegalPageEditor } from "@/components/admin/legal-page-editor";

export const metadata: Metadata = {
  title: "Terms & Conditions Editor | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminLegalEditorPage() {
  const content = await getLegalPageContent("terms-conditions");
  return <LegalPageEditor pageKey="terms-conditions" editorTitle="Terms & Conditions" publicPath="/terms" initialData={content} />;
}
