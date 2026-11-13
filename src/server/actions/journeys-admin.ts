"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { authorize, can, canEditRecord } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";
import { zodErrors, type ActionResult } from "@/lib/validation/content";
import {
  guidanceSchema,
  homepageSchema,
  journeyFormSchema,
  journeySchema,
  RESERVED_GUIDANCE_SLUGS,
  reviewSchema,
} from "@/lib/validation/journeys";
import { ActionError, resolveWorkflow, revalidatePublic, runAction, STATUS_VERB } from "./helpers";

const invalid = (error: Parameters<typeof zodErrors>[0]) => ({
  ok: false as const,
  message: "Please fix the highlighted fields.",
  errors: zodErrors(error),
});

/* ─────────── Homepage ─────────── */

export async function saveHomepage(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("settings.manage");
    const parsed = homepageSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const d = parsed.data;
    await prisma.homepageSettings.upsert({ where: { id: 1 }, create: { id: 1, ...d }, update: d });
    await logAudit({
      userId: user.id,
      action: "update",
      entityType: "HomepageSettings",
      entityId: "1",
      summary: "Updated homepage",
    });
    revalidatePublic();
    return { ok: true, message: "Homepage saved." };
  });
}

/* ─────────── Journeys ─────────── */

export async function saveJourney(id: string, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("settings.manage");
    const parsed = journeySchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const j = await prisma.journey.update({ where: { id }, data: parsed.data });
    await logAudit({
      userId: user.id,
      action: "update",
      entityType: "Journey",
      entityId: id,
      summary: `Updated journey “${j.title}”`,
    });
    revalidatePublic();
    return { ok: true, message: `${j.title} saved.` };
  });
}

/* ─────────── Guidance ─────────── */

export async function saveGuidance(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction<{ id: string }>(async () => {
    const user = await authorize("content.create");
    const parsed = guidanceSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const d = parsed.data;

    const existing = id ? await prisma.guidanceArticle.findUnique({ where: { id } }) : null;
    if (id && !existing) throw new ActionError("This guide no longer exists.");
    if (existing && !canEditRecord(user, existing)) throw new ActionError("You can't edit this guide.");
    if (!(await prisma.journey.findUnique({ where: { id: d.journeyId }, select: { id: true } })))
      throw new ActionError("Please fix the highlighted fields.", { journeyId: "Choose a journey." });

    const workflow = resolveWorkflow(user, d, existing);
    const taken = async (s: string) =>
      RESERVED_GUIDANCE_SLUGS.includes(s) ||
      (await prisma.guidanceArticle.count({
        where: { journeyId: d.journeyId, slug: s, ...(existing ? { NOT: { id: existing.id } } : {}) },
      })) > 0;
    let slug = d.slug;
    if (slug) {
      if (await taken(slug))
        throw new ActionError("Please fix the highlighted fields.", {
          slug: "This slug is already used in this journey.",
        });
    } else slug = await uniqueSlug(slugify(d.translations.en.title) || "guide", taken);

    // Only reviewers (publish permission) can record a review date.
    const canReview = can(user, "content.publish");
    const reviewed = canReview
      ? {
          lastReviewedAt: d.lastReviewedAt ? new Date(`${d.lastReviewedAt}T00:00:00Z`) : null,
          reviewedById: d.lastReviewedAt
            ? existing?.lastReviewedAt?.toISOString().slice(0, 10) === d.lastReviewedAt
              ? existing.reviewedById
              : user.id
            : null,
        }
      : {};

    const base = { journeyId: d.journeyId, slug, ...workflow, coverId: d.coverId, videoId: d.videoId, ...reviewed };

    const g = await prisma.$transaction(async (tx) => {
      const a = existing
        ? await tx.guidanceArticle.update({ where: { id: existing.id }, data: base })
        : await tx.guidanceArticle.create({ data: { ...base, createdById: user.id } });
      await tx.guidanceArticleTranslation.upsert({
        where: { articleId_locale: { articleId: a.id, locale: "en" } },
        create: { articleId: a.id, locale: "en", ...d.translations.en },
        update: d.translations.en,
      });
      const km = d.translations.km;
      if (km.title) {
        const kmData = { ...km, title: km.title };
        await tx.guidanceArticleTranslation.upsert({
          where: { articleId_locale: { articleId: a.id, locale: "km" } },
          create: { articleId: a.id, locale: "km", ...kmData },
          update: kmData,
        });
      } else await tx.guidanceArticleTranslation.deleteMany({ where: { articleId: a.id, locale: "km" } });

      await tx.guidanceSection.deleteMany({ where: { articleId: a.id } });
      await tx.guidanceSection.createMany({
        data: d.sections.map((s, i) => ({ ...s, articleId: a.id, sortOrder: i })),
      });
      await tx.guidanceReference.deleteMany({ where: { articleId: a.id } });
      await tx.guidanceReference.createMany({
        data: d.references.map((r, i) => ({ ...r, articleId: a.id, sortOrder: i })),
      });
      return a;
    });

    await logAudit({
      userId: user.id,
      action: existing ? STATUS_VERB[g.status] : "create",
      entityType: "GuidanceArticle",
      entityId: g.id,
      summary: `${existing ? "Updated" : "Created"} guide “${d.translations.en.title}” (${g.status.toLowerCase()})`,
    });
    revalidatePublic();
    return { ok: true, message: "Saved.", data: { id: g.id } };
  });
}

export async function deleteGuidance(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("content.delete");
    const g = await prisma.guidanceArticle.findUnique({
      where: { id },
      include: { translations: { where: { locale: "en" }, select: { title: true } } },
    });
    if (!g) throw new ActionError("This guide no longer exists.");
    await prisma.guidanceArticle.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "delete",
      entityType: "GuidanceArticle",
      entityId: id,
      summary: `Deleted guide “${g.translations[0]?.title ?? g.slug}”`,
    });
    revalidatePublic();
    return { ok: true, message: "Deleted." };
  });
}

/* ─────────── Forms ─────────── */

export async function saveJourneyForm(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction<{ id: string }>(async () => {
    const user = await authorize("forms.manage");
    const parsed = journeyFormSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const { fields, ...d } = parsed.data;
    const existing = id
      ? await prisma.journeyForm.findUnique({ where: { id }, include: { fields: { select: { id: true } } } })
      : null;
    if (id && !existing) throw new ActionError("This form no longer exists.");

    const form = await prisma.$transaction(async (tx) => {
      const f = existing
        ? await tx.journeyForm.update({ where: { id: existing.id }, data: d })
        : await tx.journeyForm.create({ data: d });
      const keepIds = new Set(fields.map((x) => x.id).filter((x): x is string => !!x));
      const ownIds = new Set(existing?.fields.map((x) => x.id) ?? []);
      // Removed fields: answers keep their key/label snapshot (fieldId becomes null).
      await tx.formField.deleteMany({ where: { formId: f.id, id: { notIn: [...keepIds] } } });
      // Temporarily move keys aside so renames/reorders never collide on (formId, key).
      for (const fid of keepIds) {
        if (ownIds.has(fid)) await tx.formField.update({ where: { id: fid }, data: { key: `__tmp_${fid}` } });
      }
      for (const [i, field] of fields.entries()) {
        const { id: fieldId, ...data } = field;
        const row = { ...data, sortOrder: i, options: data.options, validation: data.validation };
        if (fieldId && ownIds.has(fieldId)) await tx.formField.update({ where: { id: fieldId }, data: row });
        else await tx.formField.create({ data: { ...row, formId: f.id } });
      }
      return f;
    });
    await logAudit({
      userId: user.id,
      action: existing ? "update" : "create",
      entityType: "JourneyForm",
      entityId: form.id,
      summary: `${existing ? "Updated" : "Created"} form “${form.title}”`,
    });
    revalidatePath("/", "layout");
    revalidatePath("/km", "layout");
    return { ok: true, message: "Form saved.", data: { id: form.id } };
  });
}

/** Deletes a form without submissions; forms with submissions are deactivated to keep the record. */
export async function deleteJourneyForm(id: string): Promise<ActionResult<{ deactivated: boolean }>> {
  return runAction<{ deactivated: boolean }>(async () => {
    const user = await authorize("forms.manage");
    const form = await prisma.journeyForm.findUnique({
      where: { id },
      include: { _count: { select: { submissions: true } } },
    });
    if (!form) throw new ActionError("This form no longer exists.");
    if (form._count.submissions > 0) {
      await prisma.journeyForm.update({ where: { id }, data: { isActive: false } });
      await logAudit({
        userId: user.id,
        action: "archive",
        entityType: "JourneyForm",
        entityId: id,
        summary: `Deactivated form “${form.title}” (has submissions)`,
      });
      return {
        ok: true,
        message: "This form has submissions, so it was deactivated instead of deleted.",
        data: { deactivated: true },
      };
    }
    await prisma.journeyForm.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "delete",
      entityType: "JourneyForm",
      entityId: id,
      summary: `Deleted form “${form.title}”`,
    });
    return { ok: true, message: "Deleted.", data: { deactivated: false } };
  });
}

/* ─────────── Submissions ─────────── */

export async function reviewSubmission(id: string, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("submissions.review");
    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const d = parsed.data;
    const s = await prisma.formSubmission.findUnique({ where: { id } });
    if (!s) throw new ActionError("This submission no longer exists.");
    const statusChanged = s.status !== d.status;
    await prisma.$transaction([
      prisma.formSubmission.update({
        where: { id },
        data: {
          status: d.status,
          internalNotes: d.internalNotes,
          reviewerId: user.id,
          reviewedAt: new Date(),
        },
      }),
      ...(statusChanged || d.note
        ? [
            prisma.submissionReviewHistory.create({
              data: { submissionId: id, fromStatus: s.status, toStatus: d.status, note: d.note, actorId: user.id },
            }),
          ]
        : []),
    ]);
    await logAudit({
      userId: user.id,
      action: "update",
      entityType: "FormSubmission",
      entityId: id,
      summary: statusChanged
        ? `Submission ${s.status.toLowerCase()} → ${d.status.toLowerCase()}`
        : "Updated submission notes",
    });
    revalidatePath(`/admin/submissions/${id}`);
    return { ok: true, message: "Review saved." };
  });
}
