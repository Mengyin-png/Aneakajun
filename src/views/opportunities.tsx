import type { Metadata } from "next";
import { OpportunityCard } from "@/components/site/cards";
import { PageHero } from "@/components/site/hero";
import { EmptyState } from "@/components/site/section";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { listOpportunities } from "@/server/queries/opportunities";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: "/opportunities",
    title: t.opportunities.title,
    description: t.opportunities.intro,
  });
}

export default async function OpportunitiesPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const items = await listOpportunities(locale);

  return (
    <>
      <PageHero
        title={t.opportunities.title}
        subtitle={t.opportunities.intro}
        crumbs={[{ href: localePath(locale, "/"), label: t.common.home }, { label: t.opportunities.title }]}
      />
      <div className="bg-canvas pt-16 pb-20">
        <div className="container-page">
          {items.length === 0 ? (
            <EmptyState text={t.opportunities.empty} />
          ) : (
            <ul className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {items.map((o) => (
                <li key={o.id}>
                  <OpportunityCard item={o} locale={locale} labels={t.opportunities} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
