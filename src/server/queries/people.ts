import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { localizedName, pickTranslation } from "@/lib/i18n/localize";
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

export type PersonCardData = {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  photoUrl: string | null;
  location: TaxonomyLabel | null;
  industry: TaxonomyLabel | null;
};

const cardInclude = {
  translations: true,
  photo: { select: { url: true } },
  location: true,
  industry: true,
} satisfies Prisma.PersonInclude;

type CardRow = Prisma.PersonGetPayload<{ include: typeof cardInclude }>;

export function toPersonCard(p: CardRow, locale: Locale): PersonCardData {
  const t = pickTranslation(p.translations, locale);
  return {
    id: p.id,
    slug: p.slug,
    name: t?.name ?? p.slug,
    headline: t?.headline ?? null,
    photoUrl: p.photo?.url ?? null,
    location: label(p.location, locale),
    industry: label(p.industry, locale),
  };
}

export type PeopleFilters = {
  q?: string;
  location?: string;
  industry?: string;
  category?: string;
};

/** Where-clause for published people matching search + filters. Used by the directory and global search. */
export function peopleWhere(f: PeopleFilters): Prisma.PersonWhereInput {
  const and: Prisma.PersonWhereInput[] = [published];
  if (f.q) {
    and.push({
      OR: [
        { translations: { some: { OR: [{ name: contains(f.q) }, { headline: contains(f.q) }] } } },
        { skills: { some: { skill: { OR: [{ name: contains(f.q) }, { nameKm: contains(f.q) }] } } } },
      ],
    });
  }
  // A location filter includes places inside it (e.g. Cambodia → Phnom Penh).
  if (f.location) and.push({ location: { OR: [{ slug: f.location }, { parent: { slug: f.location } }] } });
  if (f.industry) and.push({ industry: { slug: f.industry } });
  if (f.category) and.push({ OR: [{ category: { slug: f.category } }, { industry: { slug: f.category } }] });
  return { AND: and };
}

export async function matchPeople(where: Prisma.PersonWhereInput, locale: Locale) {
  const rows = await prisma.person.findMany({
    where,
    select: {
      id: true,
      publishedAt: true,
      translations: { select: { locale: true, name: true, headline: true } },
    },
    take: 2000,
  });
  return rows.map((r) => ({
    id: r.id,
    date: r.publishedAt,
    names: translatedNames(r.translations, locale),
    fields: r.translations.map((t) => t.headline),
  }));
}

export async function listPeople(
  f: PeopleFilters & { sort: SortOption; page: number },
  locale: Locale,
): Promise<Paginated<PersonCardData>> {
  const rows = await matchPeople(peopleWhere(f), locale);
  const { ids, total, page, pageCount } = sortAndPage(rows, { sort: f.sort, q: f.q ?? "", page: f.page, locale });
  const people = await prisma.person.findMany({ where: { id: { in: ids } }, include: cardInclude });
  return { items: inOrder(ids, people).map((p) => toPersonCard(p, locale)), total, page, pageCount };
}

export async function getFeaturedPeople(locale: Locale, take = 4) {
  const people = await prisma.person.findMany({
    where: { ...published, isFeatured: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    include: cardInclude,
    take,
  });
  return people.map((p) => toPersonCard(p, locale));
}

export async function getRecentPeople(locale: Locale, take = 4) {
  const people = await prisma.person.findMany({
    where: published,
    orderBy: { createdAt: "desc" },
    include: cardInclude,
    take,
  });
  return people.map((p) => toPersonCard(p, locale));
}

const profileInclude = {
  translations: true,
  photo: true,
  location: { include: { parent: true } },
  industry: true,
  category: true,
  skills: { include: { skill: true } },
  education: { orderBy: { sortOrder: "asc" } },
  experience: { orderBy: { sortOrder: "asc" }, include: { organization: { select: { slug: true, status: true } } } },
  memberships: {
    where: { organization: published },
    orderBy: { sortOrder: "asc" },
    include: { organization: { include: { translations: true, logo: { select: { url: true } } } } },
  },
} satisfies Prisma.PersonInclude;

/** Loads a profile. `includeUnpublished` is only used by the admin preview. */
export async function getPersonProfile(
  where: { slug: string } | { id: string },
  locale: Locale,
  includeUnpublished = false,
) {
  const person = await prisma.person.findFirst({
    where: { ...where, ...(includeUnpublished ? {} : published) },
    include: profileInclude,
  });
  if (!person) return null;

  const t = pickTranslation(person.translations, locale);
  const articles = await prisma.article.findMany({
    where: { ...published, OR: [{ authorPersonId: person.id }, { people: { some: { personId: person.id } } }] },
    orderBy: { publishedAt: "desc" },
    include: { translations: true },
    take: 6,
  });

  return {
    id: person.id,
    slug: person.slug,
    status: person.status,
    name: t?.name ?? person.slug,
    headline: t?.headline ?? null,
    bio: t?.bio ?? null,
    seoTitle: t?.seoTitle ?? null,
    seoDescription: t?.seoDescription ?? null,
    photo: person.photo
      ? {
          url: person.photo.url,
          alt: localizedName({ name: person.photo.altText ?? "", nameKm: person.photo.altTextKm }, locale),
        }
      : null,
    location: person.location
      ? {
          ...label(person.location, locale)!,
          parent: label(person.location.parent, locale),
        }
      : null,
    industry: label(person.industry, locale),
    category: label(person.category, locale),
    links: {
      website: person.websiteUrl,
      linkedin: person.linkedinUrl,
      facebook: person.facebookUrl,
      x: person.xUrl,
      email: person.email,
    },
    skills: person.skills.map((s) => label(s.skill, locale)!),
    education: person.education,
    experience: person.experience.map((e) => ({
      ...e,
      organizationSlug: e.organization?.status === "PUBLISHED" ? e.organization.slug : null,
    })),
    organizations: person.memberships.map((m) => ({
      slug: m.organization.slug,
      name: pickTranslation(m.organization.translations, locale)?.name ?? m.organization.slug,
      role: m.role,
      isCurrent: m.isCurrent,
      logoUrl: m.organization.logo?.url ?? null,
    })),
    articles: articles.map((a) => ({
      slug: a.slug,
      title: pickTranslation(a.translations, locale)?.title ?? a.slug,
      publishedAt: a.publishedAt,
    })),
    updatedAt: person.updatedAt,
  };
}

export type PersonProfile = NonNullable<Awaited<ReturnType<typeof getPersonProfile>>>;
