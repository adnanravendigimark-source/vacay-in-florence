import type { Metadata } from "next";
import { BlogPostEditor } from "@/components/admin/blog-post-editor";
import type { BlogPostFormData } from "@/lib/validation/blog";

export const metadata: Metadata = {
  title: "New Article | Admin | VACAY Florence",
  robots: { index: false },
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_VALUES: BlogPostFormData = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Travel Tips",
  tags: [],
  author: "VACAY Florence Editorial",
  status: "draft",
  publishDate: todayIso(),
  quickAnswer: "",
  body: "",
  coverImageUrl: "",
  coverImageAlt: "",
  metaTitle: null,
  metaDescription: null,
  canonicalUrl: null,
  ogImage: null,
  noIndex: false,
  noFollow: false,
  ctaHeading: "Ready to plan your Florence trip?",
  ctaBody:
    "Browse skip-the-line tickets, guided tours, and day trips — booked in minutes, free cancellation up to 24h before.",
  ctaButtonText: "Browse experiences",
  ctaButtonHref: "/experiences",
};

export default function NewBlogPostPage() {
  return <BlogPostEditor mode="create" initialValues={EMPTY_VALUES} />;
}
