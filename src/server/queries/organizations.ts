import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { pickTranslation } from "@/lib/i18n/localize";
import { toPersonCard } from "./people";
import {
  contains,
  inOrder,
  label,
  published,
  sortAndPage,
  translatedNames,
  type Paginated,
  type SortOption,
  type TaxonomyLabel,
} from "./shared";

export type OrganizationCardData = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  location: TaxonomyLabel | null;
  industry: TaxonomyLabel | null;
};

const cardInclude = {
  translations: true,
  logo: { select: { url: true } },
  location: true,
  industry: true,
} satisfies Prisma.OrganizationInclude;

type CardRow = Prisma.OrganizationGetPayload<{ include: typeof cardInclude }>;

export function toOrganizationCard(o: CardRow, locale: Locale): OrganizationCardData {
  const t = pickTranslation(o.translations, locale);
  return {
    id: o.id,
    slug: o.slug,
    name: t?.name ?? o.slug,
    tagline: t?.tagline ?? null,
    logoUrl: o.logo?.url ?? null,
    location: label(o.location, locale),
    industry: label(o.industry, locale),
  };
}

export type OrganizationFilters = { q?: string; location?: string; industry?: string; category?: string };

export function organizationsWhere(f: OrganizationFilters): Prisma.OrganizationWhereInput {
  const and: Prisma.OrganizationWhereInput[] = [published];
  if (f.q) {
    and.push({
      translations: {
        some: { OR: [{ name: contains(f.q) }, { tagline: contains(f.q) }, { description: contains(f.q) }] },
      },
    });
  }
  if (f.location) and.push({ location: { OR: [{ slug: f.location }, { parent: { slug: f.location } }] } });
  if (f.industry) and.push({ industry: { slug: f.industry } });
  if (f.category) and.push({ OR: [{ category: { slug: f.category } }, { industry: { slug: f.category } }] });
  return { AND: and };
}

export async function matchOrganizations(where: Prisma.OrganizationWhereInput, locale: Locale) {
  const rows = await prisma.organization.findMany({
    where,
    select: {
      id: true,
      publishedAt: true,
      translations: { select: { locale: true, name: true, tagline: true, description: true } },
    },
    take: 2000,
  });
  return rows.map((r) => ({
    id: r.id,
    date: r.publishedAt,
    names: translatedNames(r.translations, locale),
    fields: r.translations.flatMap((t) => [t.tagline, t.description]),
  }));
}

export async function listOrganizations(
  f: OrganizationFilters & { sort: SortOption; page: number },
  locale: Locale,
): Promise<Paginated<OrganizationCardData>> {
  const rows = await matchOrganizations(organizationsWhere(f), locale);
  const { ids, total, page, pageCount } = sortAndPage(rows, { sort: f.sort, q: f.q ?? "", page: f.page, locale });
  const orgs = await prisma.organization.findMany({ where: { id: { in: ids } }, include: cardInclude });
  return { items: inOrder(ids, orgs).map((o) => toOrganizationCard(o, locale)), total, page, pageCount };
}

export async function getFeaturedOrganizations(locale: Locale, take = 4) {
  const orgs = await prisma.organization.findMany({
    where: { ...published, isFeatured: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    include: cardInclude,
    take,
  });
  return orgs.map((o) => toOrganizationCard(o, locale));
}

export async function getRecentOrganizations(locale: Locale, take = 4) {
  const orgs = await prisma.organization.findMany({
    where: published,
    orderBy: { createdAt: "desc" },
    include: cardInclude,
    take,
  });
  return orgs.map((o) => toOrganizationCard(o, locale));
}

export async function getOrganizationProfile(
  where: { slug: string } | { id: string },
  locale: Locale,
  includeUnpublished = false,
) {
  const org = await prisma.organization.findFirst({
    where: { ...where, ...(includeUnpublished ? {} : published) },
    include: {
      translations: true,
      logo: true,
      cover: true,
      location: { include: { parent: true } },
      industry: true,
      category: true,
      members: {
        where: { person: published },
        orderBy: [{ isKeyPerson: "desc" }, { sortOrder: "asc" }],
        include: {
          person: { include: { translations: true, photo: { select: { url: true } }, location: true, industry: true } },
        },
      },
    },
  });
  if (!org) return null;

  const t = pickTranslation(org.translations, locale);
  const articles = await prisma.article.findMany({
    where: { ...published, organizations: { some: { organizationId: org.id } } },
    orderBy: { publishedAt: "desc" },
    include: { translations: true },
    take: 6,
  });

  return {
    id: org.id,
    slug: org.slug,
    status: org.status,
    name: t?.name ?? org.slug,
    tagline: t?.tagline ?? null,
    description: t?.description ?? null,
    mission: t?.mission ?? null,
    vision: t?.vision ?? null,
    activities: (t?.activities ?? "")
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean),
    address: t?.address ?? null,
    seoTitle: t?.seoTitle ?? null,
    seoDescription: t?.seoDescription ?? null,
    logoUrl: org.logo?.url ?? null,
    coverUrl: org.cover?.url ?? null,
    location: org.location ? { ...label(org.location, locale)!, parent: label(org.location.parent, locale) } : null,
    industry: label(org.industry, locale),
    category: label(org.category, locale),
    foundedYear: org.foundedYear,
    contact: {
      website: org.websiteUrl,
      email: org.email,
      phone: org.phone,
      facebook: org.facebookUrl,
      linkedin: org.linkedinUrl,
    },
    members: org.members.map((m) => ({
      role: m.role,
      isKeyPerson: m.isKeyPerson,
      isCurrent: m.isCurrent,
      person: toPersonCard(m.person, locale),
    })),
    articles: articles.map((a) => ({
      slug: a.slug,
      title: pickTranslation(a.translations, locale)?.title ?? a.slug,
      publishedAt: a.publishedAt,
    })),
    updatedAt: org.updatedAt,
  };
}

export type OrganizationProfile = NonNullable<Awaited<ReturnType<typeof getOrganizationProfile>>>;
