"use server";

import { logAudit } from "@/lib/audit";
import { authorize } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { settingsSchema } from "@/lib/validation/admin";
import { zodErrors, type ActionResult } from "@/lib/validation/content";
import { revalidatePublic, runAction } from "./helpers";

export async function updateSettings(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("settings.manage");
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
    await prisma.siteSettings.upsert({ where: { id: 1 }, create: { id: 1, ...parsed.data }, update: parsed.data });
    await logAudit({
      userId: user.id,
      action: "update",
      entityType: "SiteSettings",
      entityId: "1",
      summary: "Updated website settings",
    });
    revalidatePublic();
    return { ok: true, message: "Settings saved." };
  });
}
