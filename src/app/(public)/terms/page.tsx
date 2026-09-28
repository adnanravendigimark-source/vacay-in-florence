import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPageContent } from "@/lib/data/site-content";
import { resolveCanonical, resolveRobots } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLegalPageContent("terms-conditions");
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: resolveCanonical("/terms") },
    robots: resolveRobots(content.seo.noIndex ?? false),
    openGraph: content.seo.ogImage ? { images: [content.seo.ogImage] } : undefined,
  };
}

export default async function TermsPage() {
  const content = await getLegalPageContent("terms-conditions");
  return <LegalPage content={content} />;
}
