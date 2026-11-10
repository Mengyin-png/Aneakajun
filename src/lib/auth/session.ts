import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { PermissionKey, RoleKey } from "./permissions";

export const SESSION_COOKIE = "ak_session";
const SESSION_DAYS = 7;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: { key: RoleKey; name: string; rank: number };
  permissions: Set<PermissionKey>;
};

/** Creates a DB-backed session and sets the httpOnly cookie. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: sha256(token), expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  store.delete(SESSION_COOKIE);
}

/** Current signed-in user (memoised per request), or null. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: {
      user: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
    },
  });
  if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: { key: user.role.key as RoleKey, name: user.role.name, rank: user.role.rank },
    permissions: new Set(user.role.permissions.map((rp) => rp.permission.key as PermissionKey)),
  };
});
