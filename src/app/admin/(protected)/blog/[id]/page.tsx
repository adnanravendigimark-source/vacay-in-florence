import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminBlogPostById } from "@/lib/data/admin/blog";
import { BlogPostEditor } from "@/components/admin/blog-post-editor";
import type { BlogPostFormData } from "@/lib/validation/blog";

export const metadata: Metadata = {
  title: "Edit Article | Admin | VACAY Florence",
  robots: { index: false },
};

type Params = { id: string };

export default async function EditBlogPostPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const post = await getAdminBlogPostById(id);
  if (!post) notFound();

  const initialValues: BlogPostFormData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags,
    author: post.author,
    status: post.status,
    publishDate: post.publishDate,
    quickAnswer: post.quickAnswer,
    body: post.body,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalUrl: post.canonicalUrl,
    ogImage: post.ogImage,
    noIndex: post.noIndex,
    noFollow: post.noFollow,
    ctaHeading: post.ctaHeading,
    ctaBody: post.ctaBody,
    ctaButtonText: post.ctaButtonText,
    ctaButtonHref: post.ctaButtonHref,
  };

  return <BlogPostEditor mode="edit" postId={id} initialValues={initialValues} />;
}
