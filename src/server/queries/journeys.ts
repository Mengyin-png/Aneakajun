import "server-only";
import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { localizedField, pickTranslation } from "@/lib/i18n/localize";
import { parseOptions, parseValidation, type FieldDef } from "@/lib/forms/schema";
import { published } from "./shared";

/* ─────────── Journeys ─────────── */

export type JourneyData = {
  id: string;
  key: string;
  title: string;
  verb: string;
  description: string | null;
  icon: string;
  accentColor: string;
  coverUrl: string | null;
  videoUrl: string | null;
  guideCount: number;
};

const journeyInclude = {
  cover: { select: { url: true } },
  video: { select: { url: true } },
  _count: { select: { articles: { where: published } } },
} satisfies Prisma.JourneyInclude;

function toJourney(j: Prisma.JourneyGetPayload<{ include: typeof journeyInclude }>, locale: Locale): JourneyData {
  return {
    id: j.id,
    key: j.key,
    title: localizedField(j.title, j.titleKm, locale) ?? j.title,
    verb: localizedField(j.verb, j.verbKm, locale) ?? j.verb,
    description: localizedField(j.description, j.descriptionKm, locale),
    icon: j.icon,
    accentColor: /^#[0-9a-f]{6}$/i.test(j.accentColor) ? j.accentColor : "#09786a",
    coverUrl: j.cover?.url ?? null,
    videoUrl: j.video?.url ?? null,
    guideCount: j._count.articles,
  };
}

export const getJourneys = cache(async (locale: Locale): Promise<JourneyData[]> => {
  const rows = await prisma.journey.findMany({
    where: { isEnabled: true },
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    include: journeyInclude,
  });
  return rows.map((j) => toJourney(j, locale));
});

export const getJourney = cache(async (key: string, locale: Locale): Promise<JourneyData | null> => {
  const j = await prisma.journey.findFirst({ where: { key, isEnabled: true }, include: journeyInclude });
  return j ? toJourney(j, locale) : null;
});

/* ─────────── Guidance ─────────── */

export type GuidanceCardData = {
  id: string;
  slug: string;
  journeyKey: string;
  journeyTitle: string;
  accentColor: string;
  title: string;
  summary: string | null;
  coverUrl: string | null;
  lastReviewedAt: Date | null;
};

const cardInclude = {
  translations: { select: { locale: true, title: true, summary: true } },
  cover: { select: { url: true } },
  journey: { select: { key: true, title: true, titleKm: true, accentColor: true } },
} satisfies Prisma.GuidanceArticleInclude;

function toCard(
  g: Prisma.GuidanceArticleGetPayload<{ include: typeof cardInclude }>,
  locale: Locale,
): GuidanceCardData {
  const t = pickTranslation(g.translations, locale);
  return {
    id: g.id,
    slug: g.slug,
    journeyKey: g.journey.key,
    journeyTitle: localizedField(g.journey.title, g.journey.titleKm, locale) ?? g.journey.title,
    accentColor: g.journey.accentColor,
    title: t?.title ?? g.slug,
    summary: t?.summary ?? null,
    coverUrl: g.cover?.url ?? null,
    lastReviewedAt: g.lastReviewedAt,
  };
}

const publicGuidance = { ...published, journey: { isEnabled: true } } satisfies Prisma.GuidanceArticleWhereInput;

export async function getJourneyGuides(journeyId: string, locale: Locale) {
  const rows = await prisma.guidanceArticle.findMany({
    where: { ...publicGuidance, journeyId },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "asc" }],
    include: cardInclude,
  });
  return rows.map((g) => toCard(g, locale));
}

export async function getFeaturedGuidance(locale: Locale, limit = 6) {
  const rows = await prisma.guidanceArticle.findMany({
    where: publicGuidance,
    orderBy: [{ isFeatured: "desc" }, { journey: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    take: limit,
    include: cardInclude,
  });
  return rows.map((g) => toCard(g, locale));
}

export type GuidanceSectionData = {
  id: string;
  kind: "CONTENT" | "NOTE" | "WARNING";
  heading: string;
  body: string;
  imageUrl: string | null;
};

export type GuidanceDetail = GuidanceCardData & {
  status: string;
  journeyId: string;
  videoUrl: string | null;
  nextSteps: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  sections: GuidanceSectionData[];
  references: { id: string; title: string; url: string; publisher: string | null }[];
};

const detailInclude = {
  translations: true,
  cover: { select: { url: true } },
  video: { select: { url: true } },
  journey: { select: { key: true, title: true, titleKm: true, accentColor: true, isEnabled: true } },
  sections: { orderBy: { sortOrder: "asc" }, include: { image: { select: { url: true } } } },
  references: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.GuidanceArticleInclude;

function toDetail(
  g: Prisma.GuidanceArticleGetPayload<{ include: typeof detailInclude }>,
  locale: Locale,
): GuidanceDetail {
  const t = pickTranslation(g.translations, locale);
  return {
    ...toCard(g, locale),
    status: g.status,
    journeyId: g.journeyId,
    videoUrl: g.video?.url ?? null,
    nextSteps: t?.nextSteps ?? null,
    seoTitle: t?.seoTitle ?? null,
    seoDescription: t?.seoDescription ?? null,
    publishedAt: g.publishedAt,
    updatedAt: g.updatedAt,
    sections: g.sections.map((s) => ({
      id: s.id,
      kind: s.kind,
      heading: localizedField(s.heading, s.headingKm, locale) ?? s.heading,
      body: localizedField(s.body, s.bodyKm, locale) ?? s.body,
      imageUrl: s.image?.url ?? null,
    })),
    references: g.references.map((r) => ({
      id: r.id,
      title: localizedField(r.title, r.titleKm, locale) ?? r.title,
      url: r.url,
      publisher: r.publisher,
    })),
  };
}

/** Published guidance for the public site. Access control (40% preview) is applied by the caller. */
export async function getGuidance(journeyKey: string, slug: string, locale: Locale): Promise<GuidanceDetail | null> {
  const g = await prisma.guidanceArticle.findFirst({
    where: { ...publicGuidance, slug, journey: { key: journeyKey, isEnabled: true } },
    include: detailInclude,
  });
  return g ? toDetail(g, locale) : null;
}

/** Any status — admin preview only (caller must authorize). */
export async function getGuidanceForPreview(id: string, locale: Locale): Promise<GuidanceDetail | null> {
  const g = await prisma.guidanceArticle.findUnique({ where: { id }, include: detailInclude });
  return g ? toDetail(g, locale) : null;
}

export async function getRelatedGuidance(journeyId: string, excludeId: string, locale: Locale, limit = 3) {
  const rows = await prisma.guidanceArticle.findMany({
    where: { ...publicGuidance, journeyId, id: { not: excludeId } },
    orderBy: [{ sortOrder: "asc" }],
    take: limit,
    include: cardInclude,
  });
  return rows.map((g) => toCard(g, locale));
}

/** Slugs for the sitemap. */
export async function guidanceSitemapEntries() {
  return prisma.guidanceArticle.findMany({
    where: publicGuidance,
    select: { slug: true, updatedAt: true, journey: { select: { key: true } } },
  });
}

/* ─────────── Homepage ─────────── */

export const HOME_SECTION_KEYS = ["journeys", "guidance", "directory", "articles", "resources", "cta"] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];
export type Resource = { title: string; url: string; description: string | null };

export function parseSections(raw: unknown): { key: HomeSectionKey; enabled: boolean }[] {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set<string>();
  const out: { key: HomeSectionKey; enabled: boolean }[] = [];
  for (const item of list) {
    const key = (item as { key?: unknown })?.key;
    if (typeof key === "string" && (HOME_SECTION_KEYS as readonly string[]).includes(key) && !seen.has(key)) {
      seen.add(key);
      out.push({ key: key as HomeSectionKey, enabled: (item as { enabled?: unknown }).enabled !== false });
    }
  }
  for (const key of HOME_SECTION_KEYS) if (!seen.has(key)) out.push({ key, enabled: true });
  return out;
}

export type RawResource = {
  title: string;
  titleKm?: string;
  url: string;
  description?: string;
  descriptionKm?: string;
};

export function parseResources(raw: unknown): RawResource[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (r): r is RawResource =>
        !!r && typeof r.title === "string" && typeof r.url === "string" && /^https?:\/\//i.test(r.url),
    )
    .slice(0, 24);
}

export const getHomepage = cache(async (locale: Locale) => {
  const h = await prisma.homepageSettings.findUnique({
    where: { id: 1 },
    include: { heroVideo: { select: { url: true } }, heroImage: { select: { url: true } } },
  });
  const f = (en: string | null | undefined, km: string | null | undefined, fallback = "") =>
    localizedField(en, km, locale) ?? fallback;
  return {
    heroPrefix: f(h?.heroPrefix, h?.heroPrefixKm, "I want to"),
    heroSuffix: f(h?.heroSuffix, h?.heroSuffixKm, "in Cambodia."),
    heroSubtitle: f(h?.heroSubtitle, h?.heroSubtitleKm) || null,
    ctaLabel: f(h?.ctaLabel, h?.ctaLabelKm, "Learn more"),
    heroVideoUrl: h?.heroVideo?.url ?? null,
    heroImageUrl: h?.heroImage?.url ?? null,
    sections: parseSections(h?.sections),
    resources: parseResources(h?.resources).map((r): Resource => ({
      title: f(r.title, r.titleKm, r.title),
      url: r.url,
      description: f(r.description, r.descriptionKm) || null,
    })),
  };
});

/* ─────────── Forms ─────────── */

export type PublicForm = {
  id: string;
  title: string;
  description: string | null;
  submitLabel: string | null;
  fields: (FieldDef & { label: string; helpText: string | null; placeholder: string | null })[];
};

/** The active form for a journey (most recently updated wins). */
export async function getActiveForm(journeyId: string, locale: Locale): Promise<PublicForm | null> {
  const form = await prisma.journeyForm.findFirst({
    where: { journeyId, isActive: true },
    orderBy: { updatedAt: "desc" },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!form) return null;
  return {
    id: form.id,
    title: localizedField(form.title, form.titleKm, locale) ?? form.title,
    description: localizedField(form.description, form.descriptionKm, locale),
    submitLabel: localizedField(form.submitLabel, form.submitLabelKm, locale),
    fields: form.fields.map((f) => ({
      key: f.key,
      type: f.type,
      required: f.required,
      label: localizedField(f.label, f.labelKm, locale) ?? f.label,
      helpText: localizedField(f.helpText, f.helpTextKm, locale),
      placeholder: f.placeholder,
      options: parseOptions(f.options).map((o) => ({
        ...o,
        label: localizedField(o.label, o.labelKm, locale) ?? o.label,
      })),
      validation: parseValidation(f.validation),
    })),
  };
}

/** A member's own submissions — status only, never internal notes. */
export async function getMySubmissions(userId: string, journeyId: string) {
  return prisma.formSubmission.findMany({
    where: { userId, journeyId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      form: { select: { title: true, titleKm: true } },
    },
  });
}

/** Published totals for the homepage "growing map" band. */
export const getHomeStats = cache(async () => {
  const [guides, people, organizations, articles] = await Promise.all([
    prisma.guidanceArticle.count({ where: publicGuidance }),
    prisma.person.count({ where: published }),
    prisma.organization.count({ where: published }),
    prisma.article.count({ where: published }),
  ]);
  return { guides, people, organizations, articles };
});
