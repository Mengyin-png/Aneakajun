import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/hero";
import { Icon } from "@/components/site/icons";
import { GuidanceCard } from "@/components/site/journey-cards";
import { EmptyState } from "@/components/site/section";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getJourney, getJourneyGuides } from "@/server/queries/journeys";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string; journey: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const journey = await getJourney((await params).journey, locale);
  if (!journey) return {};
  return pageMetadata({ locale, path: `/${journey.key}`, title: journey.title, description: journey.description });
}

export default async function JourneyPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const journey = await getJourney((await params).journey, locale);
  if (!journey) notFound();
  const t = getDictionary(locale);
  const guides = await getJourneyGuides(journey.id, locale);

  return (
    <>
      <PageHero
        title={journey.title}
        subtitle={journey.description}
        crumbs={[{ href: localePath(locale, "/"), label: t.nav.home }, { label: journey.title }]}
      />
      <section className="section bg-canvas">
        <div className="container-page">
          <h2 className="mb-8 flex items-center gap-3 text-[1.6rem] font-normal text-black">
            <span
              className="grid size-11 place-items-center rounded-full text-white"
              style={{ background: journey.accentColor }}
            >
              <Icon name={journey.icon} className="size-5" />
            </span>
            {t.journey.startHere}
          </h2>
          {guides.length === 0 ? (
            <EmptyState text={t.journey.noGuides} />
          ) : (
            <ol className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => (
                <li key={g.id}>
                  <GuidanceCard guide={g} locale={locale} reviewedLabel={t.guidance.lastReviewed} />
                </li>
              ))}
            </ol>
          )}
          <div className="mt-14 flex flex-col items-start gap-4 rounded-[7px] bg-white p-7 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg text-black">{t.guidance.applyCta}</h2>
              <p className="mt-1 text-ink-soft">{t.form.privacy}</p>
            </div>
            <Link href={localePath(locale, `/${journey.key}/form`)} className="btn-primary h-[43px] shrink-0 px-6">
              {t.form.title}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
