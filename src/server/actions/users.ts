"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { authorize } from "@/lib/auth/guard";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { createUserSchema, updateUserSchema } from "@/lib/validation/admin";
import { zodErrors, type ActionResult } from "@/lib/validation/content";
import { ActionError, runAction } from "./helpers";

export async function createUser(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await authorize("users.manage");
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
    const d = parsed.data;
    if (await prisma.user.findUnique({ where: { email: d.email } })) {
      throw new ActionError("Please fix the highlighted fields.", { email: "A user with this email already exists." });
    }
    const user = await prisma.user.create({
      data: { email: d.email, name: d.name, roleId: d.roleId, passwordHash: await hashPassword(d.password) },
      include: { role: true },
    });
    await logAudit({
      userId: actor.id,
      action: "create",
      entityType: "User",
      entityId: user.id,
      summary: `Created user ${user.email} (${user.role.name})`,
    });
    revalidatePath("/admin/users");
    return { ok: true, message: "User created." };
  });
}

export async function updateUser(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await authorize("users.manage");
    const parsed = updateUserSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
    const d = parsed.data;

    const target = await prisma.user.findUnique({ where: { id: d.id }, include: { role: true } });
    if (!target) throw new ActionError("This user no longer exists.");
    const newRole = await prisma.role.findUnique({ where: { id: d.roleId } });
    if (!newRole) throw new ActionError("Please fix the highlighted fields.", { roleId: "Choose a valid role." });

    if (target.id === actor.id && (!d.isActive || newRole.key !== target.role.key)) {
      throw new ActionError("You can't deactivate yourself or change your own role.");
    }
    // Never remove the last active Super Admin.
    if (target.role.key === "SUPER_ADMIN" && (newRole.key !== "SUPER_ADMIN" || !d.isActive)) {
      const others = await prisma.user.count({
        where: { role: { key: "SUPER_ADMIN" }, isActive: true, NOT: { id: target.id } },
      });
      if (others === 0) throw new ActionError("At least one active Super Admin is required.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: d.id },
        data: {
          name: d.name,
          roleId: d.roleId,
          isActive: d.isActive,
          ...(d.newPassword
            ? { passwordHash: await hashPassword(d.newPassword), failedLoginCount: 0, lockedUntil: null }
            : {}),
        },
      });
      // Role/password/active changes end existing sessions.
      if (d.newPassword || !d.isActive || newRole.key !== target.role.key) {
        await tx.session.deleteMany({ where: { userId: d.id } });
      }
    });

    await logAudit({
      userId: actor.id,
      action: "update",
      entityType: "User",
      entityId: d.id,
      summary: `Updated user ${target.email}${d.newPassword ? " (password reset)" : ""}`,
      metadata: { role: newRole.key, isActive: d.isActive },
    });
    revalidatePath("/admin/users");
    return { ok: true, message: "User updated." };
  });
}
