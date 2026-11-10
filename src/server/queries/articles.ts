import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { pickTranslation } from "@/lib/i18n/localize";
import { toOrganizationCard } from "./organizations";
import { toPersonCard } from "./people";
import {
  contains,
  inOrder,
  label,
  published,
  sortAndPage,
  type Paginated,
  type SortOption,
  type TaxonomyLabel,
} from "./shared";

export type ArticleCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  category: TaxonomyLabel | null;
  publishedAt: Date | null;
  authorName: string | null;
};

const cardInclude = {
  translations: { select: { locale: true, title: true, excerpt: true } },
  featuredImage: { select: { url: true } },
  category: true,
  authorPerson: { select: { translations: { select: { locale: true, name: true } } } },
} satisfies Prisma.ArticleInclude;

type CardRow = Prisma.ArticleGetPayload<{ include: typeof cardInclude }>;

export function toArticleCard(a: CardRow, locale: Locale): ArticleCardData {
  const t = pickTranslation(a.translations, locale);
  return {
    id: a.id,
    slug: a.slug,
    title: t?.title ?? a.slug,
    excerpt: t?.excerpt ?? null,
    imageUrl: a.featuredImage?.url ?? null,
    category: label(a.category, locale),
    publishedAt: a.publishedAt,
    authorName: a.authorPerson ? (pickTranslation(a.authorPerson.translations, locale)?.name ?? null) : null,
  };
}

export type ArticleFilters = { q?: string; category?: string; tag?: string };

export function articlesWhere(f: ArticleFilters): Prisma.ArticleWhereInput {
  const and: Prisma.ArticleWhereInput[] = [published];
  if (f.q) {
    and.push({
      OR: [
        {
          translations: {
            some: { OR: [{ title: contains(f.q) }, { excerpt: contains(f.q) }, { body: contains(f.q) }] },
          },
        },
        { tags: { some: { tag: { OR: [{ name: contains(f.q) }, { nameKm: contains(f.q) }] } } } },
      ],
    });
  }
  if (f.category) and.push({ category: { slug: f.category } });
  if (f.tag) and.push({ tags: { some: { tag: { slug: f.tag } } } });
  return { AND: and };
}

export async function matchArticles(where: Prisma.ArticleWhereInput, locale: Locale) {
  const rows = await prisma.article.findMany({
    where,
    select: { id: true, publishedAt: true, translations: { select: { locale: true, title: true, excerpt: true } } },
    take: 2000,
  });
  return rows.map((r) => {
    const own = pickTranslation(r.translations, locale);
    return {
      id: r.id,
      date: r.publishedAt,
      names: [own?.title ?? "", ...r.translations.filter((t) => t !== own).map((t) => t.title)],
      fields: r.translations.map((t) => t.excerpt),
    };
  });
}

export async function listArticles(
  f: ArticleFilters & { sort: SortOption; page: number },
  locale: Locale,
): Promise<Paginated<ArticleCardData>> {
  const rows = await matchArticles(articlesWhere(f), locale);
  const { ids, total, page, pageCount } = sortAndPage(rows, { sort: f.sort, q: f.q ?? "", page: f.page, locale });
  const articles = await prisma.article.findMany({ where: { id: { in: ids } }, include: cardInclude });
  return { items: inOrder(ids, articles).map((a) => toArticleCard(a, locale)), total, page, pageCount };
}

export async function getLatestArticles(locale: Locale, take = 3) {
  const articles = await prisma.article.findMany({
    where: published,
    orderBy: { publishedAt: "desc" },
    include: cardInclude,
    take,
  });
  return articles.map((a) => toArticleCard(a, locale));
}

export async function getArticle(where: { slug: string } | { id: string }, locale: Locale, includeUnpublished = false) {
  const article = await prisma.article.findFirst({
    where: { ...where, ...(includeUnpublished ? {} : published) },
    include: {
      translations: true,
      featuredImage: true,
      category: true,
      tags: { include: { tag: true } },
      authorPerson: {
        include: { translations: true, photo: { select: { url: true } }, location: true, industry: true },
      },
      people: {
        where: { person: published },
        include: {
          person: { include: { translations: true, photo: { select: { url: true } }, location: true, industry: true } },
        },
      },
      organizations: {
        where: { organization: published },
        include: {
          organization: {
            include: { translations: true, logo: { select: { url: true } }, location: true, industry: true },
          },
        },
      },
    },
  });
  if (!article) return null;

  const t = pickTranslation(article.translations, locale)!;
  const tagIds = article.tags.map((x) => x.tagId);
  const related = await prisma.article.findMany({
    where: {
      ...published,
      id: { not: article.id },
      OR: [
        ...(article.categoryId ? [{ categoryId: article.categoryId }] : []),
        ...(tagIds.length ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
      ],
    },
    orderBy: { publishedAt: "desc" },
    include: cardInclude,
    take: 3,
  });

  const author = article.authorPerson && article.authorPerson.status === "PUBLISHED" ? article.authorPerson : null;

  return {
    id: article.id,
    slug: article.slug,
    status: article.status,
    title: t.title,
    excerpt: t.excerpt,
    body: t.body,
    /** True when the requested locale had no translation and English is shown. */
    isFallback: t.locale !== locale,
    seoTitle: t.seoTitle,
    seoDescription: t.seoDescription,
    image: article.featuredImage ? { url: article.featuredImage.url, alt: article.featuredImage.altText ?? "" } : null,
    category: label(article.category, locale),
    tags: article.tags.map((x) => label(x.tag, locale)!),
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    author: author
      ? { ...toPersonCard(author, locale), bio: pickTranslation(author.translations, locale)?.headline ?? null }
      : null,
    people: article.people.map((p) => toPersonCard(p.person, locale)),
    organizations: article.organizations.map((o) => toOrganizationCard(o.organization, locale)),
    related: related.map((r) => toArticleCard(r, locale)),
  };
}

export type ArticleDetail = NonNullable<Awaited<ReturnType<typeof getArticle>>>;
