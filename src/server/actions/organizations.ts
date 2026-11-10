"use server";

import { logAudit } from "@/lib/audit";
import { authorize, canEditRecord } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { organizationSchema, zodErrors, type ActionResult } from "@/lib/validation/content";
import {
  ActionError,
  assertCategory,
  resolveSlug,
  resolveWorkflow,
  revalidatePublic,
  runAction,
  STATUS_VERB,
} from "./helpers";

export async function saveOrganization(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction<{ id: string; slug: string }>(async () => {
    const user = await authorize("content.create");
    const parsed = organizationSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
    const d = parsed.data;

    const existing = id ? await prisma.organization.findUnique({ where: { id } }) : null;
    if (id && !existing) throw new ActionError("This organization no longer exists.");
    if (existing && !canEditRecord(user, existing)) throw new ActionError("You can't edit this organization.");

    await assertCategory(d.industryId, "INDUSTRY", "industryId");
    await assertCategory(d.categoryId, "ORGANIZATION", "categoryId");
    const workflow = resolveWorkflow(user, d, existing);
    const slug = await resolveSlug("organization", d.slug, d.translations.en.name, id ?? undefined);

    const base = {
      slug,
      ...workflow,
      logoId: d.logoId,
      coverId: d.coverId,
      locationId: d.locationId,
      industryId: d.industryId,
      categoryId: d.categoryId,
      foundedYear: d.foundedYear,
      websiteUrl: d.websiteUrl,
      email: d.email,
      phone: d.phone,
      facebookUrl: d.facebookUrl,
      linkedinUrl: d.linkedinUrl,
    };

    const org = await prisma.$transaction(async (tx) => {
      const o = existing
        ? await tx.organization.update({ where: { id: existing.id }, data: base })
        : await tx.organization.create({ data: { ...base, createdById: user.id } });

      const en = d.translations.en;
      await tx.organizationTranslation.upsert({
        where: { organizationId_locale: { organizationId: o.id, locale: "en" } },
        create: { organizationId: o.id, locale: "en", ...en },
        update: en,
      });
      const km = d.translations.km;
      if (km.name) {
        const kmData = { ...km, name: km.name };
        await tx.organizationTranslation.upsert({
          where: { organizationId_locale: { organizationId: o.id, locale: "km" } },
          create: { organizationId: o.id, locale: "km", ...kmData },
          update: kmData,
        });
      } else {
        await tx.organizationTranslation.deleteMany({ where: { organizationId: o.id, locale: "km" } });
      }

      await tx.organizationMember.deleteMany({ where: { organizationId: o.id } });
      await tx.organizationMember.createMany({
        data: d.members.map((m, sortOrder) => ({ ...m, organizationId: o.id, sortOrder })),
      });
      return o;
    });

    await logAudit({
      userId: user.id,
      action: existing ? STATUS_VERB[org.status] : "create",
      entityType: "Organization",
      entityId: org.id,
      summary: `${existing ? "Updated" : "Created"} organization “${d.translations.en.name}” (${org.status.toLowerCase()})`,
    });
    revalidatePublic();
    return { ok: true, message: "Saved.", data: { id: org.id, slug: org.slug } };
  });
}

export async function deleteOrganization(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const user = await authorize("content.delete");
    const org = await prisma.organization.findUnique({
      where: { id },
      include: { translations: { where: { locale: "en" }, select: { name: true } } },
    });
    if (!org) throw new ActionError("This organization no longer exists.");
    await prisma.organization.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "delete",
      entityType: "Organization",
      entityId: id,
      summary: `Deleted organization “${org.translations[0]?.name ?? org.slug}”`,
    });
    revalidatePublic();
    return { ok: true, message: "Deleted." };
  });
}
