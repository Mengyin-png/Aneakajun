"use server";

import { logAudit } from "@/lib/audit";
import { authorize, canEditRecord } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { articleSchema, zodErrors, type ActionResult } from "@/lib/validation/content";
import {
  ActionError,
  assertCategory,
  resolveSlug,
  resolveWorkflow,
  revalidatePublic,
  runAction,
  STATUS_VERB,
} from "./helpers";

export async function saveArticle(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction<{ id: string; slug: string }>(async () => {
    const user = await authorize("content.create");
    const parsed = articleSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
    const d = parsed.data;

    const existing = id ? await prisma.article.findUnique({ where: { id } }) : null;
    if (id && !existing) throw new ActionError("This article no longer exists.");
    if (existing && !canEditRecord(user, existing)) throw new ActionError("You can't edit this article.");

    await assertCategory(d.categoryId, "ARTICLE", "categoryId");
    const workflow = resolveWorkflow(user, d, existing);
    const slug = await resolveSlug("article", d.slug, d.translations.en.title, id ?? undefined);

    const base = {
      slug,
      ...workflow,
      categoryId: d.categoryId,
      authorPersonId: d.authorPersonId,
      featuredImageId: d.featuredImageId,
    };

    const article = await prisma.$transaction(async (tx) => {
      const a = existing
        ? await tx.article.update({ where: { id: existing.id }, data: base })
        : await tx.article.create({ data: { ...base, createdById: user.id } });

      const en = d.translations.en;
      await tx.articleTranslation.upsert({
        where: { articleId_locale: { articleId: a.id, locale: "en" } },
        create: { articleId: a.id, locale: "en", ...en },
        update: en,
      });
      const km = d.translations.km;
      if (km.title && km.body) {
        const kmData = { ...km, title: km.title, body: km.body };
        await tx.articleTranslation.upsert({
          where: { articleId_locale: { articleId: a.id, locale: "km" } },
          create: { articleId: a.id, locale: "km", ...kmData },
          update: kmData,
        });
      } else {
        await tx.articleTranslation.deleteMany({ where: { articleId: a.id, locale: "km" } });
      }

      await tx.articleTag.deleteMany({ where: { articleId: a.id } });
      await tx.articleTag.createMany({ data: d.tagIds.map((tagId) => ({ articleId: a.id, tagId })) });
      await tx.articlePerson.deleteMany({ where: { articleId: a.id } });
      await tx.articlePerson.createMany({ data: d.personIds.map((personId) => ({ articleId: a.id, personId })) });
      await tx.articleOrganization.deleteMany({ where: { articleId: a.id } });
      await tx.articleOrganization.createMany({
        data: d.organizationIds.map((organizationId) => ({ articleId: a.id, organizationId })),
      });
      return a;
    });

    await logAudit({
      userId: user.id,
      action: existing ? STATUS_VERB[article.status] : "create",
      entityType: "Article",
      entityId: article.id,
      summary: `${existing ? "Updated" : "Created"} article “${d.translations.en.title}” (${article.status.toLowerCase()})`,
    });
    revalidatePublic();
    return { ok: true, message: "Saved.", data: { id: article.id, slug: article.slug } };
  });
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("content.delete");
    const article = await prisma.article.findUnique({
      where: { id },
      include: { translations: { where: { locale: "en" }, select: { title: true } } },
    });
    if (!article) throw new ActionError("This article no longer exists.");
    await prisma.article.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "delete",
      entityType: "Article",
      entityId: id,
      summary: `Deleted article “${article.translations[0]?.title ?? article.slug}”`,
    });
    revalidatePublic();
    return { ok: true, message: "Deleted." };
  });
}
