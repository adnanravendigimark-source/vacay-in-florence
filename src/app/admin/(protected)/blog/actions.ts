"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { blogPostFormSchema, type BlogPostFormInput } from "@/lib/validation/blog";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  setBlogPostStatus,
  type MutationResult,
  type AdminBlogStatus,
} from "@/lib/data/admin/blog";
import { slugifyCategory } from "@/lib/data/blog";

/**
 * Every mutation below revalidates the exact public routes that read
 * `blog_posts` (per src/lib/data/blog.ts): the blog index, the post's
 * own article page, its category filter page, the homepage's Travel
 * Guide teaser section (src/components/home/travel-guide.tsx reads
 * getLatestBlogPosts), the sitemap, and the admin list itself.
 */
function revalidateBlogRoutes(slug?: string, previousSlug?: string, category?: string, previousCategory?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/blog/${previousSlug}`);
  if (category) revalidatePath(`/blog/category/${slugifyCategory(category)}`);
  if (previousCategory && previousCategory !== category) revalidatePath(`/blog/category/${slugifyCategory(previousCategory)}`);
}

export async function createBlogPostAction(input: BlogPostFormInput): Promise<MutationResult> {
  const staff = await requirePermission("content.manage", "/admin/blog");
  const parsed = blogPostFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const result = await createBlogPost(parsed.data);
  if (result.success) {
    revalidateBlogRoutes(parsed.data.slug, undefined, parsed.data.category);
    await logAudit({ actorUserId: staff.userId, action: "blog_post.create", entityType: "blog_post", entityId: result.id, after: { title: parsed.data.title, slug: parsed.data.slug } });
  }
  return result;
}

export async function updateBlogPostAction(
  id: string,
  input: BlogPostFormInput,
  previousSlug?: string,
  previousCategory?: string,
): Promise<MutationResult> {
  const staff = await requirePermission("content.manage", "/admin/blog");
  const parsed = blogPostFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const result = await updateBlogPost(id, parsed.data);
  if (result.success) {
    revalidateBlogRoutes(parsed.data.slug, previousSlug, parsed.data.category, previousCategory);
    await logAudit({ actorUserId: staff.userId, action: "blog_post.update", entityType: "blog_post", entityId: id, after: { title: parsed.data.title, slug: parsed.data.slug } });
  }
  return result;
}

export async function deleteBlogPostAction(id: string, slug?: string, category?: string): Promise<MutationResult> {
  const staff = await requirePermission("content.manage", "/admin/blog");
  const result = await deleteBlogPost(id);
  if (result.success) {
    revalidateBlogRoutes(slug, undefined, category);
    await logAudit({ actorUserId: staff.userId, action: "blog_post.delete", entityType: "blog_post", entityId: id, before: { slug, category } });
  }
  return result;
}

export async function setBlogPostStatusAction(
  id: string,
  status: AdminBlogStatus,
  slug?: string,
  category?: string,
): Promise<MutationResult> {
  const staff = await requirePermission("content.manage", "/admin/blog");
  const result = await setBlogPostStatus(id, status);
  if (result.success) {
    revalidateBlogRoutes(slug, undefined, category);
    await logAudit({ actorUserId: staff.userId, action: "blog_post.status_change", entityType: "blog_post", entityId: id, after: { status } });
  }
  return result;
}
