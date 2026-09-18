import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPageContent } from "@/lib/data/site-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How VACAY Florence collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPolicyPage() {
  const content = await getLegalPageContent("privacy-policy");
  return <LegalPage content={content} />;
}
