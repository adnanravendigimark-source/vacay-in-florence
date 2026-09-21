import { NextResponse, type NextRequest } from "next/server";
import { getSearchSuggestions } from "@/lib/data/search";

// Always dynamic — results depend on the live catalog and the caller's
// query string, so this must never be statically cached at build time.
export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 100;

/**
 * Backs the homepage search bar's autocomplete dropdown. GET-only,
 * read-only, no auth required (same visibility as the public catalog
 * it searches) — intentionally minimal so it stays fast under
 * debounced, per-keystroke calls from the client.
 */
export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
  const query = rawQuery.slice(0, MAX_QUERY_LENGTH);

  try {
    const result = await getSearchSuggestions(query);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[api/search] suggestion lookup failed:", error);
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 500 });
  }
}
