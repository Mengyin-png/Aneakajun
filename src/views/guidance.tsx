import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { GuidanceBody } from "@/components/site/guidance-body";
import { PageHero } from "@/components/site/hero";
import { getCurrentUser } from "@/lib/auth/session";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getGuidance, getRelatedGuidance } from "@/server/queries/journeys";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string; journey: string; slug: string }> };

const load = cache((journey: string, slug: string, locale: Locale) => getGuidance(journey, slug, locale));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { journey, slug } = await params;
  const g = await load(journey, slug, locale);
  if (!g) return {};
  return pageMetadata({
    locale,
    path: `/${g.journeyKey}/${g.slug}`,
    title: g.seoTitle || g.title,
    description: g.seoDescription || g.summary,
    image: g.coverUrl ?? undefined,
    type: "article",
  });
}

export const signInHref = (path: string) => `/auth/google/start?next=${encodeURIComponent(`${path}#continue`)}`;

export default async function GuidancePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const { journey, slug } = await params;
  const [guide, user] = await Promise.all([load(journey, slug, locale), getCurrentUser()]);
  if (!guide) notFound();
  const t = getDictionary(locale);
  const related = await getRelatedGuidance(guide.journeyId, guide.id, locale);
  const path = localePath(locale, `/${guide.journeyKey}/${guide.slug}`);

  return (
    <>
      <PageHero
        title={guide.title}
        crumbs={[
          { href: localePath(locale, "/"), label: t.nav.home },
          { href: localePath(locale, `/${guide.journeyKey}`), label: guide.journeyTitle },
          { label: guide.title },
        ]}
      />
      <GuidanceBody
        guide={guide}
        related={related}
        locale={locale}
        t={t}
        fullAccess={!!user}
        signInHref={signInHref(path)}
        formHref={localePath(locale, `/${guide.journeyKey}/form`)}
      />
    </>
  );
}
