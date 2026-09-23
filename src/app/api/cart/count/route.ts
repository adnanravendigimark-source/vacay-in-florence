import { NextResponse } from "next/server";
import { getCartItemCount } from "@/lib/cart";

// Tiny JSON endpoint so the (client-side) header can show a real cart
// badge without forcing every page in the app to render dynamically —
// see the note in src/components/auth/session-provider.tsx for the same
// tradeoff applied to the sign-in icon.
export async function GET() {
  try {
    const count = await getCartItemCount();
    return NextResponse.json({ count }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[api/cart/count] lookup failed:", error);
    // The header already treats a non-OK response as "leave the badge
    // as-is" (see site-header.tsx), so this just needs to fail cleanly
    // as JSON rather than surface Next's default HTML error page.
    return NextResponse.json({ error: "Cart count unavailable." }, { status: 500 });
  }
}
