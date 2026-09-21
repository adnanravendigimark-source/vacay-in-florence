import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Account pages share a layout (src/app/account/layout.tsx) that runs its
 * own auth guard before any nested page renders, but a layout has no way
 * to know which nested route was actually requested. Without this, the
 * layout's guard always redirected unauthenticated visitors back to
 * /login?redirectTo=%2Faccount, even when they'd deep-linked to
 * /account/bookings or /account/security — so after signing in they'd
 * land on the account overview instead of where they meant to go. This
 * middleware stamps the real pathname onto a header so the layout (and
 * anything else under /account) can build the correct redirectTo.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/account/:path*"],
};
