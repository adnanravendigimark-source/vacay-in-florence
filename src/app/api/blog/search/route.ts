import { NextResponse, type NextRequest } from "next/server";
import { searchBlogPosts, getBlogCategoryBySlug } from "@/lib/data/blog";

// Always dynamic — results depend on the live, published post set and
// the caller's query string, so this must never be statically cached.
export const dynamic = "force-dynamic";

/**
 * Backs the /blog and /blog/category/[slug] listing pages' infinite-
 * scroll "load more" requests. GET-only, read-only, same visibility as
 * the public blog it searches (published posts only, no auth required)
 * — mirrors src/app/api/experiences/route.ts.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const q = params.get("q") ?? undefined;
  const categorySlug = params.get("category") ?? undefined;
  const page = Number.parseInt(params.get("page") ?? "1", 10) || 1;
  const pageSize = Number.parseInt(params.get("pageSize") ?? "9", 10) || 9;

  try {
    // blog_posts.category stores the display name ("Day Trips"), not the
    // URL slug ("day-trips") — resolve it the same way
    // /blog/category/[slug] does before filtering.
    const category = categorySlug ? (await getBlogCategoryBySlug(categorySlug))?.name : undefined;
    const result = await searchBlogPosts({ q, category, page, pageSize });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[api/blog/search] listing lookup failed:", error);
    return NextResponse.json({ error: "Article listing is temporarily unavailable." }, { status: 500 });
  }
}
