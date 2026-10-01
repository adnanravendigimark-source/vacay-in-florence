import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Content & SEO | Admin | VACAY Florence",
  robots: { index: false },
};

interface ContentPageCard {
  title: string;
  description: string;
  editorHref: string;
  publicHref: string;
}

const PAGES: ContentPageCard[] = [
  {
    title: "Homepage",
    description: "Hero, featured sections, and testimonials shown on the homepage.",
    editorHref: "/admin/content/homepage",
    publicHref: "/",
  },
  {
    title: "About Us",
    description: "Story, values, and call-to-action content on the About page.",
    editorHref: "/admin/content/about",
    publicHref: "/about",
  },
  {
    title: "Contact Us",
    description: "Hero copy, contact email, and info cards on the Contact page.",
    editorHref: "/admin/content/contact",
    publicHref: "/contact",
  },
  {
    title: "Privacy Policy",
    description: "Legal page hero and section content.",
    editorHref: "/admin/content/privacy",
    publicHref: "/privacy",
  },
  {
    title: "Terms & Conditions",
    description: "Legal page hero and section content.",
    editorHref: "/admin/content/terms",
    publicHref: "/terms",
  },
  {
    title: "Cancellation & Refund Policy",
    description: "Legal page hero and section content.",
    editorHref: "/admin/content/cancellation-policy",
    publicHref: "/cancellation-policy",
  },
  {
    title: "Become a Supplier",
    description: "Hero, benefit cards, and the supplier application form's fields.",
    editorHref: "/admin/content/become-a-supplier",
    publicHref: "/become-a-supplier",
  },
  {
    title: "Become an Affiliate",
    description: "Hero, benefit cards, and the affiliate application form's fields.",
    editorHref: "/admin/content/affiliates",
    publicHref: "/affiliates",
  },
];

export default function AdminContentHubPage() {
  return (
    <div className="mx-auto max-w-5xl pb-16">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">Content & SEO</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Edit the copy, images, and SEO details for each public page. Changes save straight to the live site.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PAGES.map((page) => (
          <div
            key={page.editorHref}
            className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="font-display text-lg font-medium text-ink">{page.title}</h2>
              <p className="mt-1 text-xs text-ink-faint">{page.description}</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button href={page.editorHref} size="sm">
                Edit content
              </Button>
              <Link
                href={page.publicHref}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                View page
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
