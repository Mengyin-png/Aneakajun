import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { localePath } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo";

// Generated per request so builds never need database access.
export const dynamic = "force-dynamic";

/** Only PUBLISHED content is listed, in both languages, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entry = (path: string, lastModified?: Date): MetadataRoute.Sitemap[number] => ({
    url: `${base}${localePath("en", path)}`,
    lastModified,
    alternates: { languages: { en: `${base}${localePath("en", path)}`, km: `${base}${localePath("km", path)}` } },
  });

  const where = { status: "PUBLISHED" } as const;
  const select = { slug: true, updatedAt: true } as const;
  const [people, orgs, articles] = await Promise.all([
    prisma.person.findMany({ where, select }),
    prisma.organization.findMany({ where, select }),
    prisma.article.findMany({ where, select }),
  ]);

  return [
    entry("/"),
    entry("/people"),
    entry("/organizations"),
    entry("/articles"),
    ...people.map((p) => entry(`/people/${p.slug}`, p.updatedAt)),
    ...orgs.map((o) => entry(`/organizations/${o.slug}`, o.updatedAt)),
    ...articles.map((a) => entry(`/articles/${a.slug}`, a.updatedAt)),
  ];
}
