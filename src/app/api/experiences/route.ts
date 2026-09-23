import { NextResponse, type NextRequest } from "next/server";
import { searchProducts, type ProductSortOption } from "@/lib/data/products";

// Always dynamic — results depend on the live catalog and the caller's
// query string, so this must never be statically cached at build time.
export const dynamic = "force-dynamic";

const VALID_SORTS: ProductSortOption[] = ["recommended", "price-asc", "price-desc", "rating"];

/**
 * Backs the /experiences and /experiences/category/[slug] listing pages'
 * infinite-scroll "load more" requests. GET-only, read-only, same
 * visibility as the public catalog it searches (no auth required) —
 * mirrors the filters the initial server-rendered page already applied
 * (q, dest, date, sort, categorySlug) so a scroll-triggered page N+1
 * request returns results consistent with what's already on screen.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const q = params.get("q") ?? undefined;
  const dest = params.get("dest") ?? undefined;
  const combinedQuery = [q, dest].filter(Boolean).join(" ").trim() || undefined;
  const date = params.get("date") ?? undefined;
  const categorySlug = params.get("categorySlug") ?? undefined;
  const sortParam = params.get("sort");
  const sort = VALID_SORTS.includes(sortParam as ProductSortOption)
    ? (sortParam as ProductSortOption)
    : "recommended";
  const page = Number.parseInt(params.get("page") ?? "1", 10) || 1;
  const pageSize = Number.parseInt(params.get("pageSize") ?? "10", 10) || 10;

  try {
    const result = await searchProducts({
      q: combinedQuery,
      date,
      categorySlug,
      sort,
      page,
      pageSize,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[api/experiences] listing lookup failed:", error);
    return NextResponse.json({ error: "Experience listing is temporarily unavailable." }, { status: 500 });
  }
}
