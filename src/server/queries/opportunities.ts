import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { localizedField, localizedName, pickTranslation } from "@/lib/i18n/localize";
import { contains, published } from "./shared";

/**
 * Read-only access to the (Phase 2) Opportunity table. Only PUBLISHED
 * opportunities are shown; there is no CMS for them yet, so the list is
 * empty until they are added.
 */
export type OpportunityCardData = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  applyUrl: string | null;
  deadline: Date | null;
  category: string | null;
  location: string | null;
  organization: { slug: string; name: string } | null;
};

const include = {
  category: true,
  location: true,
  organization: { select: { slug: true, status: true, translations: { select: { locale: true, name: true } } } },
} satisfies Prisma.OpportunityInclude;

type Row = Prisma.OpportunityGetPayload<{ include: typeof include }>;

export function toOpportunityCard(o: Row, locale: Locale): OpportunityCardData {
  return {
    id: o.id,
    slug: o.slug,
    title: localizedField(o.title, o.titleKm, locale) ?? o.title,
    description: localizedField(o.description, o.descriptionKm, locale),
    applyUrl: o.applyUrl,
    deadline: o.deadline,
    category: o.category ? localizedName(o.category, locale) : null,
    location: o.location ? localizedName(o.location, locale) : null,
    organization:
      o.organization && o.organization.status === "PUBLISHED"
        ? {
            slug: o.organization.slug,
            name: pickTranslation(o.organization.translations, locale)?.name ?? o.organization.slug,
          }
        : null,
  };
}

export function opportunitiesWhere(f: {
  q?: string;
  location?: string;
  category?: string;
}): Prisma.OpportunityWhereInput {
  const and: Prisma.OpportunityWhereInput[] = [
    published,
    { OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
  ];
  if (f.q) and.push({ OR: [{ title: contains(f.q) }, { titleKm: contains(f.q) }, { description: contains(f.q) }] });
  if (f.location) and.push({ location: { OR: [{ slug: f.location }, { parent: { slug: f.location } }] } });
  if (f.category) and.push({ category: { slug: f.category } });
  return { AND: and };
}

export async function listOpportunities(locale: Locale, take = 60) {
  const rows = await prisma.opportunity.findMany({
    where: opportunitiesWhere({}),
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    include,
    take,
  });
  return rows.map((o) => toOpportunityCard(o, locale));
}

export async function matchOpportunities(where: Prisma.OpportunityWhereInput) {
  const rows = await prisma.opportunity.findMany({
    where,
    select: { id: true, title: true, titleKm: true, description: true, createdAt: true },
    take: 2000,
  });
  return rows.map((r) => ({
    id: r.id,
    date: r.createdAt,
    names: [r.title, ...(r.titleKm ? [r.titleKm] : [])],
    fields: [r.description],
  }));
}

export async function opportunitiesByIds(ids: string[], locale: Locale) {
  if (ids.length === 0) return [];
  const rows = await prisma.opportunity.findMany({ where: { id: { in: ids } }, include });
  return rows.map((o) => toOpportunityCard(o, locale));
}
