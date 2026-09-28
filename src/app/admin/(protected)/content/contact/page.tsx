import type { Metadata } from "next";
import { getContactPageContent } from "@/lib/data/site-content";
import { ContactPageEditor } from "@/components/admin/contact-page-editor";

export const metadata: Metadata = {
  title: "Contact Us Editor | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminContactEditorPage() {
  const content = await getContactPageContent();
  return <ContactPageEditor initialData={content} />;
}
