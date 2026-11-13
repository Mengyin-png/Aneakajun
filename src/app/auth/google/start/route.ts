import { NextResponse, type NextRequest } from "next/server";
import {
  authorizationUrl,
  createOAuthRequest,
  googleConfig,
  OAUTH_COOKIE,
  safeNext,
  signInPath,
} from "@/lib/auth/google";

/** Starts Google sign-in. ?next=/visit/... is where the user returns afterwards. */
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const cfg = googleConfig();
  if (!cfg) {
    const url = new URL(signInPath(next), request.url);
    url.search = new URLSearchParams({ error: "not_configured", next }).toString();
    return NextResponse.redirect(url);
  }
  const req = createOAuthRequest(next);
  const res = NextResponse.redirect(authorizationUrl(cfg, req.state, req.challenge));
  res.cookies.set(OAUTH_COOKIE, req.cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth/google",
    maxAge: 600,
  });
  return res;
}
