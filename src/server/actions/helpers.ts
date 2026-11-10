import "server-only";
import { Prisma, type CategoryType, type ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { can, PermissionError } from "@/lib/auth/guard";
import type { SessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { ActionResult, FieldErrors } from "@/lib/validation/content";

export class ActionError extends Error {
  constructor(
    message: string,
    public readonly errors?: FieldErrors,
  ) {
    super(message);
  }
}

/** Wraps an action: maps permission, validation and database errors to friendly results. */
export async function runAction<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ActionError) return { ok: false, message: err.message, errors: err.errors };
    if (err instanceof PermissionError) return { ok: false, message: "You don't have permission to do that." };
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002")
        return { ok: false, message: "That value is already in use.", errors: { slug: "This slug is already used." } };
      if (err.code === "P2003")
        return { ok: false, message: "A selected item no longer exists. Reload and try again." };
      if (err.code === "P2025") return { ok: false, message: "This item no longer exists." };
    }
    // Next.js redirects/notFound must propagate.
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[admin action]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

/**
 * Applies publishing rules. Users without content.publish (contributors) may
 * only save DRAFT or IN_REVIEW and cannot change featured/order flags.
 */
export function resolveWorkflow(
  user: SessionUser,
  requested: { status: ContentStatus; isFeatured: boolean; sortOrder: number },
  existing?: { status: ContentStatus; isFeatured: boolean; sortOrder: number; publishedAt: Date | null } | null,
) {
  const canPublish = can(user, "content.publish");
  if (!canPublish && (requested.status === "PUBLISHED" || requested.status === "ARCHIVED")) {
    throw new ActionError("You can save a draft or submit it for review; an editor will publish it.", {
      status: "Choose Draft or In review.",
    });
  }
  const status = requested.status;
  return {
    status,
    isFeatured: canPublish ? requested.isFeatured : (existing?.isFeatured ?? false),
    sortOrder: canPublish ? requested.sortOrder : (existing?.sortOrder ?? 0),
    publishedAt: status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
  };
}

type SlugModel = "person" | "organization" | "article";

/** Uses the requested slug (if unique) or generates one from `source`. */
export async function resolveSlug(model: SlugModel, requested: string, source: string, excludeId?: string) {
  const taken = async (slug: string) => {
    const where = { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) };
    const n =
      model === "person"
        ? await prisma.person.count({ where })
        : model === "organization"
          ? await prisma.organization.count({ where })
          : await prisma.article.count({ where });
    return n > 0;
  };
  if (requested) {
    if (await taken(requested))
      throw new ActionError("Please fix the highlighted fields.", { slug: "This slug is already used." });
    return requested;
  }
  return uniqueSlug(slugify(source), taken);
}

/** Ensures a category id (if given) is of the expected type. */
export async function assertCategory(id: string | null, type: CategoryType, field: string) {
  if (!id) return;
  const c = await prisma.category.findUnique({ where: { id }, select: { type: true } });
  if (!c || c.type !== type)
    throw new ActionError("Please fix the highlighted fields.", { [field]: "Choose a valid option." });
}

/** Refreshes cached public pages and the sitemap after content changes. */
export function revalidatePublic() {
  // Purges every cached page under both public root layouts: English (/) and Khmer (/km).
  revalidatePath("/", "layout");
  revalidatePath("/km", "layout");
}

export const STATUS_VERB: Record<ContentStatus, "update" | "publish" | "archive"> = {
  DRAFT: "update",
  IN_REVIEW: "update",
  PUBLISHED: "publish",
  ARCHIVED: "archive",
};
