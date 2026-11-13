import "server-only";
import { createHash, randomBytes } from "node:crypto";

/**
 * Google OAuth 2.0 (authorization code flow + PKCE + state).
 * Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and SITE_URL; see docs/GOOGLE_SIGN_IN.md.
 */
export const OAUTH_COOKIE = "ak_oauth";

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  const site = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return { clientId, clientSecret, redirectUri: `${site}/auth/google/callback` };
}

/** Only same-site relative paths are allowed as post-login destinations. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  if (next.startsWith("/admin") || next.startsWith("/auth")) return "/";
  return next.slice(0, 500);
}

const b64url = (buf: Buffer) => buf.toString("base64url");

export function createOAuthRequest(next: string) {
  const state = b64url(randomBytes(24));
  const verifier = b64url(randomBytes(48));
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  return { state, verifier, challenge, cookieValue: JSON.stringify({ state, verifier, next: safeNext(next) }) };
}

export function authorizationUrl(cfg: NonNullable<ReturnType<typeof googleConfig>>, state: string, challenge: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
};

/** Exchanges the code for tokens and reads the verified profile from Google (both over TLS). */
export async function fetchGoogleProfile(
  cfg: NonNullable<ReturnType<typeof googleConfig>>,
  code: string,
  verifier: string,
): Promise<GoogleProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: cfg.redirectUri,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!tokenRes.ok) throw new Error(`token exchange failed (${tokenRes.status})`);
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("no access token");

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!infoRes.ok) throw new Error(`userinfo failed (${infoRes.status})`);
  const info = (await infoRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!info.sub || !info.email) throw new Error("incomplete profile");
  return {
    sub: info.sub,
    email: info.email.toLowerCase(),
    emailVerified: info.email_verified === true,
    name: (info.name || info.email.split("@")[0]).slice(0, 100),
    picture: info.picture?.startsWith("https://") ? info.picture.slice(0, 500) : null,
  };
}

/** The sign-in page in the language of the page the user came from. */
export const signInPath = (next: string) =>
  next === "/km" || next.startsWith("/km/") || next.startsWith("/km#") ? "/km/signin" : "/signin";
