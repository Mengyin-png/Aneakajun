import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/google";
import { destroySession } from "@/lib/auth/session";

/** Member sign-out (POST only; same-origin forms). */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return new NextResponse("Forbidden", { status: 403 });
  await destroySession();
  const form = await request.formData().catch(() => null);
  const next = safeNext(form?.get("next")?.toString());
  return NextResponse.redirect(new URL(next, request.url), 303);
}
