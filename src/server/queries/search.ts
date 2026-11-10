import "server-only";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { pickTranslation } from "@/lib/i18n/localize";
import { articlesWhere, matchArticles, toArticleCard, type ArticleCardData } from "./articles";
import { matchOrganizations, organizationsWhere, toOrganizationCard, type OrganizationCardData } from "./organizations";
import { matchOpportunities, opportunitiesByIds, opportunitiesWhere, type OpportunityCardData } from "./opportunities";
import { matchPeople, peopleWhere, toPersonCard, type PersonCardData } from "./people";
import { contains, published, sortAndPage, type SortOption } from "./shared";

export type SearchType = "all" | "person" | "organization" | "article" | "opportunity";

export type SearchResult =
  | { type: "person"; data: PersonCardData }
  | { type: "organization"; data: OrganizationCardData }
  | { type: "article"; data: ArticleCardData }
  | { type: "opportunity"; data: OpportunityCardData };

export function parseSearchType(value: string | undefined): SearchType {
  return value === "person" || value === "organization" || value === "article" || value === "opportunity"
    ? value
    : "all";
}

/**
 * Global search across people, organizations and articles with shared
 * filters. Location applies to people/organizations; category matches a
 * person's/organization's industry or category, or an article's category.
 */
export async function globalSearch(
  params: { q: string; type: SearchType; location?: string; category?: string; sort: SortOption; page: number },
  locale: Locale,
) {
  const { q, type, location, category } = params;
  const want = (t: Exclude<SearchType, "all">) => type === "all" || type === t;
  // Articles have no location, so a location filter excludes them.
  const includeArticles = want("article") && !location;

  const [people, orgs, articles, opportunities] = await Promise.all([
    want("person") ? matchPeople(peopleWhere({ q, location, category }), locale) : [],
    want("organization") ? matchOrganizations(organizationsWhere({ q, location, category }), locale) : [],
    includeArticles ? matchArticles(articlesWhere({ q, category }), locale) : [],
    want("opportunity") ? matchOpportunities(opportunitiesWhere({ q, location, category })) : [],
  ]);

  const rows = [
    ...people.map((r) => ({ ...r, kind: "person" as const })),
    ...orgs.map((r) => ({ ...r, kind: "organization" as const })),
    ...articles.map((r) => ({ ...r, kind: "article" as const })),
    ...opportunities.map((r) => ({ ...r, kind: "opportunity" as const })),
  ];
  const kindOf = new Map(rows.map((r) => [r.id, r.kind]));
  const { ids, total, page, pageCount } = sortAndPage(rows, { sort: params.sort, q, page: params.page, locale });

  const pick = (k: string) => ids.filter((id) => kindOf.get(id) === k);
  const [p, o, a, op] = await Promise.all([
    prisma.person.findMany({
      where: { id: { in: pick("person") } },
      include: { translations: true, photo: { select: { url: true } }, location: true, industry: true },
    }),
    prisma.organization.findMany({
      where: { id: { in: pick("organization") } },
      include: { translations: true, logo: { select: { url: true } }, location: true, industry: true },
    }),
    prisma.article.findMany({
      where: { id: { in: pick("article") } },
      include: {
        translations: { select: { locale: true, title: true, excerpt: true } },
        featuredImage: { select: { url: true } },
        category: true,
        authorPerson: { select: { translations: { select: { locale: true, name: true } } } },
      },
    }),
    opportunitiesByIds(pick("opportunity"), locale),
  ]);

  const byId = new Map<string, SearchResult>([
    ...p.map((x) => [x.id, { type: "person", data: toPersonCard(x, locale) }] as const),
    ...o.map((x) => [x.id, { type: "organization", data: toOrganizationCard(x, locale) }] as const),
    ...a.map((x) => [x.id, { type: "article", data: toArticleCard(x, locale) }] as const),
    ...op.map((x) => [x.id, { type: "opportunity", data: x }] as const),
  ]);

  return {
    items: ids.map((id) => byId.get(id)).filter((x): x is SearchResult => Boolean(x)),
    total,
    page,
    pageCount,
    counts: {
      person: people.length,
      organization: orgs.length,
      article: articles.length,
      opportunity: opportunities.length,
    },
  };
}

export type Suggestion = { type: "person" | "organization" | "article"; slug: string; label: string };

/** Fast name-only suggestions for the search box (max 8). */
export async function searchSuggestions(q: string, locale: Locale): Promise<Suggestion[]> {
  if (q.length < 2) return [];
  const [people, orgs, articles] = await Promise.all([
    prisma.person.findMany({
      where: { ...published, translations: { some: { name: contains(q) } } },
      select: { slug: true, translations: { select: { locale: true, name: true } } },
      take: 4,
    }),
    prisma.organization.findMany({
      where: { ...published, translations: { some: { name: contains(q) } } },
      select: { slug: true, translations: { select: { locale: true, name: true } } },
      take: 3,
    }),
    prisma.article.findMany({
      where: { ...published, translations: { some: { title: contains(q) } } },
      select: { slug: true, translations: { select: { locale: true, title: true } } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);
  return [
    ...people.map((x) => ({
      type: "person" as const,
      slug: x.slug,
      label: pickTranslation(x.translations, locale)?.name ?? x.slug,
    })),
    ...orgs.map((x) => ({
      type: "organization" as const,
      slug: x.slug,
      label: pickTranslation(x.translations, locale)?.name ?? x.slug,
    })),
    ...articles.map((x) => ({
      type: "article" as const,
      slug: x.slug,
      label: pickTranslation(x.translations, locale)?.title ?? x.slug,
    })),
  ].slice(0, 8);
}
