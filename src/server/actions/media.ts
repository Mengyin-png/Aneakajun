"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { authorize, can } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, sniffImageType } from "@/lib/media-validation";
import { getStorage } from "@/lib/storage";
import type { ActionResult } from "@/lib/validation/content";
import { ActionError, revalidatePublic, runAction } from "./helpers";

export type MediaItem = {
  id: string;
  url: string;
  originalName: string;
  altText: string | null;
  altTextKm: string | null;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
};

const toItem = (m: {
  id: string;
  url: string;
  originalName: string;
  altText: string | null;
  altTextKm: string | null;
  sizeBytes: number;
  mimeType: string;
  createdAt: Date;
}): MediaItem => ({
  ...m,
  createdAt: m.createdAt.toISOString(),
});

export async function uploadMedia(formData: FormData): Promise<ActionResult<MediaItem>> {
  return runAction(async () => {
    const user = await authorize("media.upload");
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw new ActionError("Choose an image to upload.");
    if (file.size > MAX_UPLOAD_BYTES) throw new ActionError("Images must be 5 MB or smaller.");

    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = sniffImageType(bytes);
    if (!mime) throw new ActionError("Only JPEG, PNG, WebP or GIF images are allowed.");

    const now = new Date();
    const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomBytes(12).toString("hex")}.${IMAGE_TYPES[mime]}`;
    const storage = getStorage();
    await storage.put(key, bytes, mime);

    const alt =
      String(formData.get("altText") ?? "")
        .trim()
        .slice(0, 200) || null;
    const media = await prisma.media.create({
      data: {
        storageKey: key,
        url: storage.publicUrl(key),
        originalName: file.name.slice(0, 200) || "image",
        mimeType: mime,
        sizeBytes: bytes.length,
        altText: alt,
        uploadedById: user.id,
      },
    });
    await logAudit({
      userId: user.id,
      action: "upload",
      entityType: "Media",
      entityId: media.id,
      summary: `Uploaded “${media.originalName}”`,
    });
    revalidatePath("/admin/media");
    return { ok: true, data: toItem(media) };
  });
}

export async function listMedia(params: { q?: string; take?: number } = {}): Promise<ActionResult<MediaItem[]>> {
  return runAction(async () => {
    await authorize("media.upload");
    const q = (params.q ?? "").trim().slice(0, 100);
    const items = await prisma.media.findMany({
      where: q
        ? {
            OR: [
              { originalName: { contains: q, mode: "insensitive" } },
              { altText: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: Math.min(params.take ?? 60, 200),
    });
    return { ok: true, data: items.map(toItem) };
  });
}

const altSchema = z.object({
  altText: z
    .string()
    .trim()
    .max(200)
    .transform((v) => v || null),
  altTextKm: z
    .string()
    .trim()
    .max(200)
    .transform((v) => v || null),
});

export async function updateMediaAlt(id: string, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("media.upload");
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new ActionError("This image no longer exists.");
    if (!can(user, "media.manage") && media.uploadedById !== user.id)
      throw new ActionError("You can only edit images you uploaded.");
    const d = altSchema.parse(input);
    await prisma.media.update({ where: { id }, data: d });
    await logAudit({
      userId: user.id,
      action: "update",
      entityType: "Media",
      entityId: id,
      summary: `Updated alt text for “${media.originalName}”`,
    });
    revalidatePublic();
    return { ok: true, message: "Saved." };
  });
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("media.manage");
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        _count: {
          select: { personPhotos: true, orgLogos: true, orgCovers: true, articleFeatured: true, eventImages: true },
        },
      },
    });
    if (!media) throw new ActionError("This image no longer exists.");
    const uses = Object.values(media._count).reduce((a, b) => a + b, 0);
    if (uses > 0) throw new ActionError(`This image is used in ${uses} place(s). Remove it from that content first.`);

    await prisma.media.delete({ where: { id } });
    await getStorage().delete(media.storageKey);
    await logAudit({
      userId: user.id,
      action: "delete",
      entityType: "Media",
      entityId: id,
      summary: `Deleted image “${media.originalName}”`,
    });
    revalidatePath("/admin/media");
    return { ok: true, message: "Deleted." };
  });
}
