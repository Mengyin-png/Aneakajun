import { NextResponse, type NextRequest } from "next/server";
import { logAudit } from "@/lib/audit";
import { fetchGoogleProfile, googleConfig, OAUTH_COOKIE, safeNext, signInPath } from "@/lib/auth/google";
import { STAFF_ROLE_KEYS, type RoleKey } from "@/lib/auth/permissions";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

function fail(request: NextRequest, error: string, next = "/") {
  const url = new URL(signInPath(next), request.url);
  url.search = new URLSearchParams({ error, next }).toString();
  const res = NextResponse.redirect(url);
  res.cookies.delete({ name: OAUTH_COOKIE, path: "/auth/google" });
  return res;
}

/** Google redirects here. Verifies state + PKCE, signs in or creates a Member account. */
export async function GET(request: NextRequest) {
  const cfg = googleConfig();
  if (!cfg) return fail(request, "not_configured");

  let saved: { state?: string; verifier?: string; next?: string } = {};
  try {
    saved = JSON.parse(request.cookies.get(OAUTH_COOKIE)?.value ?? "{}");
  } catch {
    /* treated as missing below */
  }
  const next = safeNext(saved.next);
  const params = request.nextUrl.searchParams;
  if (params.get("error")) return fail(request, "cancelled", next);
  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state || !saved.state || !saved.verifier || state !== saved.state)
    return fail(request, "invalid_state", next);

  let profile;
  try {
    profile = await fetchGoogleProfile(cfg, code, saved.verifier);
  } catch (err) {
    console.error("[google sign-in]", err instanceof Error ? err.message : err);
    return fail(request, "google_error", next);
  }
  if (!profile.emailVerified) return fail(request, "unverified_email", next);

  let user = await prisma.user.findUnique({ where: { googleSub: profile.sub }, include: { role: true } });
  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email: profile.email }, include: { role: true } });
    if (byEmail) {
      // Never let a Google login take over a staff account; staff use the admin sign-in.
      if (STAFF_ROLE_KEYS.includes(byEmail.role.key as RoleKey)) return fail(request, "staff_account", next);
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { googleSub: profile.sub },
        include: { role: true },
      });
    } else {
      const memberRole = await prisma.role.findUnique({ where: { key: "MEMBER" } });
      if (!memberRole) return fail(request, "google_error", next);
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleSub: profile.sub,
          avatarUrl: profile.picture,
          roleId: memberRole.id,
        },
        include: { role: true },
      });
      await logAudit({
        userId: user.id,
        action: "create",
        entityType: "User",
        entityId: user.id,
        summary: `New member ${user.email} (Google)`,
      });
    }
  }
  if (!user.isActive) return fail(request, "inactive", next);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), name: profile.name, avatarUrl: profile.picture },
  });
  await prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
  await createSession(user.id);

  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.delete({ name: OAUTH_COOKIE, path: "/auth/google" });
  return res;
}
