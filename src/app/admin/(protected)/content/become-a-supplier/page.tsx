import type { Metadata } from "next";
import { getSupplierPageContent } from "@/lib/data/site-content";
import { LeadPageEditor } from "@/components/admin/lead-page-editor";

export const metadata: Metadata = {
  title: "Become a Supplier Editor | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminSupplierEditorPage() {
  const content = await getSupplierPageContent();
  return (
    <LeadPageEditor
      pageKey="become-a-supplier"
      editorTitle="Become a Supplier"
      publicPath="/become-a-supplier"
      initialData={content}
    />
  );
}
