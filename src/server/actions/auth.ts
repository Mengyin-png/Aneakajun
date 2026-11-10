"use server";

import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation/admin";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
// Compared against when the email is unknown, so timing doesn't reveal which emails exist.
const DUMMY_HASH =
  "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

export type LoginState = { error?: string; fieldErrors?: { email?: string; password?: string } };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    const fe: LoginState["fieldErrors"] = {};
    for (const i of parsed.error.issues) fe[i.path[0] as "email" | "password"] ??= i.message;
    return { fieldErrors: fe };
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    return {
      error: `Too many failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.`,
    };
  }

  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.isActive) {
    if (user) {
      const failed = user.failedLoginCount + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: failed >= MAX_ATTEMPTS ? 0 : failed,
          lockedUntil: failed >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
        },
      });
    }
    return { error: "Incorrect email or password." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  // Clean up this user's expired sessions while we're here.
  await prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
  await createSession(user.id);
  await logAudit({
    userId: user.id,
    action: "login",
    entityType: "User",
    entityId: user.id,
    summary: `${user.email} signed in`,
  });

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  const user = await getCurrentUser();
  await destroySession();
  if (user)
    await logAudit({
      userId: user.id,
      action: "logout",
      entityType: "User",
      entityId: user.id,
      summary: `${user.email} signed out`,
    });
  redirect("/admin/login");
}
