import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPageContent } from "@/lib/data/site-content";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "Cancellation windows, refund handling, and what happens if a supplier cancels your experience.",
  alternates: { canonical: "/cancellation-policy" },
};

export default async function CancellationPolicyPage() {
  const content = await getLegalPageContent("cancellation-policy");
  return <LegalPage content={content} />;
}
