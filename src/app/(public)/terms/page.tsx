import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPageContent } from "@/lib/data/site-content";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you book an experience through VACAY Florence.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const content = await getLegalPageContent("terms-conditions");
  return <LegalPage content={content} />;
}
