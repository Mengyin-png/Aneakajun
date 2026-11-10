import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AuditAction = "create" | "update" | "delete" | "publish" | "archive" | "login" | "logout" | "upload";

/** Records an admin action. Never throws — a logging failure must not break the action itself. */
export async function logAudit(entry: {
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({ data: { ...entry, entityId: entry.entityId ?? null } });
  } catch (err) {
    console.error("[audit] failed to write log:", err instanceof Error ? err.message : err);
  }
}
