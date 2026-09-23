import type { MetadataRoute } from "next";
import { getAllCategories } from "@/lib/data/categories";
import { getLatestBlogPosts } from "@/lib/data/blog";
import { searchProducts } from "@/lib/data/products";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vacayinflorence.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, posts, productPage] = await Promise.all([
    getAllCategories(),
    getLatestBlogPosts(50),
    searchProducts({ pageSize: 100 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/experiences`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/become-a-supplier`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/affiliates`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/cancellation-policy`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/experiences/category/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Individually indexable product pages — previously missing from the
  // sitemap entirely, which meant search engines had no direct path to
  // them beyond following on-site links.
  const productRoutes: MetadataRoute.Sitemap = productPage.items.map((product) => ({
    url: `${siteUrl}/experiences/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...postRoutes];
}
