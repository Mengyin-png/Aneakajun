import { NextResponse } from "next/server";
import { can } from "@/lib/auth/guard";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/**
 * Who is signed in, for the header menu. Fetched client-side so public pages
 * stay statically cacheable. Returns only display data.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "private, no-store" } });
  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { avatarUrl: true } });
  return NextResponse.json(
    { user: { name: user.name, avatarUrl: row?.avatarUrl ?? null, isStaff: can(user, "admin.access") } },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
