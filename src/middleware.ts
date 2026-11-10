import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "ak_session";

/**
 * - /admin requires a session cookie (the session itself is verified server-side).
 * - /en/... redirects to the unprefixed English URL (English lives at the root,
 *   Khmer under /km — each has real routes, so ISR caching works for both).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !request.cookies.has(SESSION_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname.slice(3) || "/";
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ["/admin", "/admin/:path*", "/en", "/en/:path*"] };
