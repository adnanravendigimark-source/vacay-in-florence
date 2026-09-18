import { NextResponse } from "next/server";
import { getCartItemCount } from "@/lib/cart";

// Tiny JSON endpoint so the (client-side) header can show a real cart
// badge without forcing every page in the app to render dynamically —
// see the note in src/components/auth/session-provider.tsx for the same
// tradeoff applied to the sign-in icon.
export async function GET() {
  const count = await getCartItemCount();
  return NextResponse.json({ count });
}
