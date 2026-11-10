"use server";

import { logAudit } from "@/lib/audit";
import { authorize, canEditRecord } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { personSchema, zodErrors, type ActionResult } from "@/lib/validation/content";
import {
  ActionError,
  assertCategory,
  resolveSlug,
  resolveWorkflow,
  revalidatePublic,
  runAction,
  STATUS_VERB,
} from "./helpers";

export async function savePerson(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction<{ id: string; slug: string }>(async () => {
    const user = await authorize("content.create");
    const parsed = personSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
    const d = parsed.data;

    const existing = id ? await prisma.person.findUnique({ where: { id } }) : null;
    if (id && !existing) throw new ActionError("This person no longer exists.");
    if (existing && !canEditRecord(user, existing)) throw new ActionError("You can't edit this profile.");

    await assertCategory(d.industryId, "INDUSTRY", "industryId");
    await assertCategory(d.categoryId, "PEOPLE", "categoryId");
    const workflow = resolveWorkflow(user, d, existing);
    const slug = await resolveSlug("person", d.slug, d.translations.en.name, id ?? undefined);

    const base = {
      slug,
      ...workflow,
      photoId: d.photoId,
      locationId: d.locationId,
      industryId: d.industryId,
      categoryId: d.categoryId,
      websiteUrl: d.websiteUrl,
      linkedinUrl: d.linkedinUrl,
      facebookUrl: d.facebookUrl,
      xUrl: d.xUrl,
      email: d.email,
    };

    const person = await prisma.$transaction(async (tx) => {
      const p = existing
        ? await tx.person.update({ where: { id: existing.id }, data: base })
        : await tx.person.create({ data: { ...base, createdById: user.id } });

      const en = d.translations.en;
      await tx.personTranslation.upsert({
        where: { personId_locale: { personId: p.id, locale: "en" } },
        create: { personId: p.id, locale: "en", ...en },
        update: en,
      });
      const km = d.translations.km;
      if (km.name) {
        const kmData = { ...km, name: km.name };
        await tx.personTranslation.upsert({
          where: { personId_locale: { personId: p.id, locale: "km" } },
          create: { personId: p.id, locale: "km", ...kmData },
          update: kmData,
        });
      } else {
        await tx.personTranslation.deleteMany({ where: { personId: p.id, locale: "km" } });
      }

      await tx.personSkill.deleteMany({ where: { personId: p.id } });
      await tx.personSkill.createMany({ data: d.skillIds.map((skillId) => ({ personId: p.id, skillId })) });
      await tx.personEducation.deleteMany({ where: { personId: p.id } });
      await tx.personEducation.createMany({
        data: d.education.map((e, sortOrder) => ({ ...e, personId: p.id, sortOrder })),
      });
      await tx.personExperience.deleteMany({ where: { personId: p.id } });
      await tx.personExperience.createMany({
        data: d.experience.map((e, sortOrder) => ({ ...e, personId: p.id, sortOrder })),
      });
      return p;
    });

    await logAudit({
      userId: user.id,
      action: existing ? STATUS_VERB[person.status] : "create",
      entityType: "Person",
      entityId: person.id,
      summary: `${existing ? "Updated" : "Created"} person “${d.translations.en.name}” (${person.status.toLowerCase()})`,
    });
    revalidatePublic();
    return { ok: true, message: "Saved.", data: { id: person.id, slug: person.slug } };
  });
}

export async function deletePerson(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("content.delete");
    const person = await prisma.person.findUnique({
      where: { id },
      include: { translations: { where: { locale: "en" }, select: { name: true } } },
    });
    if (!person) throw new ActionError("This person no longer exists.");
    await prisma.person.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "delete",
      entityType: "Person",
      entityId: id,
      summary: `Deleted person “${person.translations[0]?.name ?? person.slug}”`,
    });
    revalidatePublic();
    return { ok: true, message: "Deleted." };
  });
}
