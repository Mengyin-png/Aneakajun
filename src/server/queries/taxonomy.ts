import "server-only";
import type { CategoryType } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { localizedField, localizedName } from "@/lib/i18n/localize";

export type Option = { value: string; label: string };

export async function categoryOptions(type: CategoryType, locale: Locale): Promise<Option[]> {
  const rows = await prisma.category.findMany({ where: { type }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return rows.map((c) => ({ value: c.slug, label: localizedName(c, locale) }));
}

/** Locations grouped so provinces/cities appear under their country. */
export async function locationOptions(locale: Locale): Promise<Option[]> {
  const rows = await prisma.location.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const roots = rows.filter((r) => !r.parentId);
  return roots.flatMap((root) => [
    { value: root.slug, label: localizedName(root, locale) },
    ...rows
      .filter((r) => r.parentId === root.id)
      .map((child) => ({ value: child.slug, label: `— ${localizedName(child, locale)}` })),
  ]);
}

export async function tagOptions(locale: Locale): Promise<Option[]> {
  const rows = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return rows.map((t) => ({ value: t.slug, label: localizedName(t, locale) }));
}

/** Featured industry categories with counts of published people + organizations. */
export async function getFeaturedCategories(locale: Locale) {
  const rows = await prisma.category.findMany({
    where: { type: "INDUSTRY", isFeatured: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          peopleInIndustry: { where: { status: "PUBLISHED" } },
          orgsInIndustry: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });
  return rows.map((c) => ({
    slug: c.slug,
    name: localizedName(c, locale),
    count: c._count.peopleInIndustry + c._count.orgsInIndustry,
  }));
}

export const getSiteSettings = cache(async () => {
  return (
    (await prisma.siteSettings.findUnique({ where: { id: 1 } })) ?? {
      id: 1,
      siteName: "Aneakajun",
      siteNameKm: null,
      tagline: null,
      taglineKm: null,
      description: null,
      descriptionKm: null,
      contactEmail: null,
      contactPhone: null,
      address: null,
      addressKm: null,
      facebookUrl: null,
      telegramUrl: null,
      youtubeUrl: null,
      linkedinUrl: null,
      footerNote: null,
      footerNoteKm: null,
      updatedAt: new Date(0),
    }
  );
});

export async function getLocalizedSettings(locale: Locale) {
  const s = await getSiteSettings();
  return {
    siteName: localizedField(s.siteName, s.siteNameKm, locale) ?? "Aneakajun",
    tagline: localizedField(s.tagline, s.taglineKm, locale),
    description: localizedField(s.description, s.descriptionKm, locale),
    address: localizedField(s.address, s.addressKm, locale),
    footerNote: localizedField(s.footerNote, s.footerNoteKm, locale),
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    social: { facebook: s.facebookUrl, telegram: s.telegramUrl, youtube: s.youtubeUrl, linkedin: s.linkedinUrl },
  };
}
