import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vacayinflorence.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/supplier-panel", "/affiliate-panel", "/api", "/checkout", "/account"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
