"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { authorize } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { taxonomyKinds, taxonomySchema, type TaxonomyKind } from "@/lib/validation/admin";
import { zodErrors, type ActionResult } from "@/lib/validation/content";
import { ActionError, revalidatePublic, runAction } from "./helpers";

const CATEGORY_TYPES = ["INDUSTRY", "PEOPLE", "ORGANIZATION", "ARTICLE"] as const;
const LOCATION_TYPES = ["COUNTRY", "PROVINCE", "CITY"] as const;
const ENTITY: Record<TaxonomyKind, string> = {
  categories: "Category",
  tags: "Tag",
  skills: "Skill",
  locations: "Location",
};

export async function saveTaxonomy(kind: TaxonomyKind, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    if (!taxonomyKinds.includes(kind)) throw new ActionError("Unknown taxonomy.");
    const user = await authorize("taxonomy.manage");
    const parsed = taxonomySchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
    const d = parsed.data;
    const slug = d.slug || slugify(d.name);
    const common = { name: d.name, nameKm: d.nameKm, slug };

    if (kind === "categories") {
      const type = CATEGORY_TYPES.find((t) => t === d.type);
      if (!type) throw new ActionError("Please fix the highlighted fields.", { type: "Choose a category type." });
      const data = { ...common, type, isFeatured: d.isFeatured ?? false, sortOrder: d.sortOrder ?? 0 };
      if (d.id) await prisma.category.update({ where: { id: d.id }, data });
      else await prisma.category.create({ data });
    } else if (kind === "locations") {
      const type = LOCATION_TYPES.find((t) => t === d.type);
      if (!type) throw new ActionError("Please fix the highlighted fields.", { type: "Choose a location type." });
      if (d.parentId && d.parentId === d.id)
        throw new ActionError("Please fix the highlighted fields.", {
          parentId: "A location can't be its own parent.",
        });
      const data = { ...common, type, parentId: d.parentId ?? null, sortOrder: d.sortOrder ?? 0 };
      if (d.id) await prisma.location.update({ where: { id: d.id }, data });
      else await prisma.location.create({ data });
    } else if (kind === "tags") {
      if (d.id) await prisma.tag.update({ where: { id: d.id }, data: common });
      else await prisma.tag.create({ data: common });
    } else {
      if (d.id) await prisma.skill.update({ where: { id: d.id }, data: common });
      else await prisma.skill.create({ data: common });
    }

    await logAudit({
      userId: user.id,
      action: d.id ? "update" : "create",
      entityType: ENTITY[kind],
      entityId: d.id ?? null,
      summary: `${d.id ? "Updated" : "Created"} ${ENTITY[kind].toLowerCase()} “${d.name}”`,
    });
    revalidatePath(`/admin/taxonomy/${kind}`);
    revalidatePublic();
    return { ok: true, message: "Saved." };
  });
}

export async function deleteTaxonomy(kind: TaxonomyKind, id: string): Promise<ActionResult> {
  return runAction(async () => {
    if (!taxonomyKinds.includes(kind)) throw new ActionError("Unknown taxonomy.");
    const user = await authorize("taxonomy.manage");
    // Related content keeps existing; references are cleared (ON DELETE SET NULL / CASCADE on join rows).
    const deleted =
      kind === "categories"
        ? await prisma.category.delete({ where: { id } })
        : kind === "locations"
          ? await prisma.location.delete({ where: { id } })
          : kind === "tags"
            ? await prisma.tag.delete({ where: { id } })
            : await prisma.skill.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "delete",
      entityType: ENTITY[kind],
      entityId: id,
      summary: `Deleted ${ENTITY[kind].toLowerCase()} “${deleted.name}”`,
    });
    revalidatePath(`/admin/taxonomy/${kind}`);
    revalidatePublic();
    return { ok: true, message: "Deleted." };
  });
}
