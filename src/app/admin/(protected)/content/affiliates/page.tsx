import type { Metadata } from "next";
import { getAffiliatePageContent } from "@/lib/data/site-content";
import { LeadPageEditor } from "@/components/admin/lead-page-editor";

export const metadata: Metadata = {
  title: "Become an Affiliate Editor | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminAffiliateEditorPage() {
  const content = await getAffiliatePageContent();
  return (
    <LeadPageEditor
      pageKey="affiliates"
      editorTitle="Become an Affiliate"
      publicPath="/affiliates"
      initialData={content}
    />
  );
}
