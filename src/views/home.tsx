import type { Metadata } from "next";
import { cardLabels } from "@/components/profiles/organization-profile";
import { ArticleCard, ListingRow, OrganizationTile, PersonCard } from "@/components/site/cards";
import { Carousel, CarouselItem } from "@/components/site/carousel";
import { CategoryStrip } from "@/components/site/category-strip";
import { CtaBand } from "@/components/site/cta-band";
import { HomeHero } from "@/components/site/hero";
import { HeroSearch } from "@/components/site/hero-search";
import { CenteredTitle, PlainTitle, UnderlineTitle } from "@/components/site/section";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getLatestArticles } from "@/server/queries/articles";
import { getFeaturedOrganizations, getRecentOrganizations } from "@/server/queries/organizations";
import { getFeaturedPeople, getRecentPeople } from "@/server/queries/people";
import {
  categoryOptions,
  getFeaturedCategories,
  getLocalizedSettings,
  locationOptions,
} from "@/server/queries/taxonomy";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const s = await getLocalizedSettings(locale);
  return pageMetadata({
    locale,
    path: "/",
    title: s.tagline ? `${s.siteName} — ${s.tagline}` : s.siteName,
    description: s.description,
  });
}

export default async function HomePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const [settings, people, orgs, articles, categories, recentPeople, recentOrgs, locations, industries] =
    await Promise.all([
      getLocalizedSettings(locale),
      getFeaturedPeople(locale, 8),
      getFeaturedOrganizations(locale, 5),
      getLatestArticles(locale, 3),
      getFeaturedCategories(locale),
      getRecentPeople(locale, 3),
      getRecentOrganizations(locale, 3),
      locationOptions(locale),
      categoryOptions("INDUSTRY", locale),
    ]);
  const labels = cardLabels(t);
  // Interleave recent people and organizations for the "Trending Today"-style grid.
  const recent = recentPeople.flatMap((p, i) => [
    { type: "person" as const, data: p },
    ...(recentOrgs[i] ? [{ type: "organization" as const, data: recentOrgs[i] }] : []),
  ]);

  return (
    <>
      <HomeHero title={t.home.heroTitle} subtitle={t.home.heroText}>
        <HeroSearch
          action={localePath(locale, "/search")}
          locale={locale}
          typeLabels={{
            person: t.search.typePerson,
            organization: t.search.typeOrganization,
            article: t.search.typeArticle,
          }}
          locations={locations}
          categories={industries}
          labels={{
            keyword: t.common.keyword,
            location: t.common.location,
            allLocations: t.common.allLocations,
            allCategories: t.common.allCategories,
            category: t.common.category,
            search: t.common.search,
          }}
        />
      </HomeHero>

      <div className="bg-canvas pb-16 sm:pb-24">
        <CategoryStrip
          label={t.home.browseCategories}
          items={categories.map((c) => ({ ...c, href: localePath(locale, `/search?category=${c.slug}`) }))}
        />

        {people.length > 0 && (
          <section className="container-page pt-16">
            <PlainTitle
              title={t.home.featuredPeople}
              href={localePath(locale, "/people")}
              linkLabel={t.common.viewAll}
            />
            <Carousel label={t.home.featuredPeople}>
              {people.map((p) => (
                <CarouselItem key={p.id}>
                  <PersonCard person={p} locale={locale} labels={labels} />
                </CarouselItem>
              ))}
            </Carousel>
          </section>
        )}
      </div>

      {orgs.length > 0 && (
        <section className="section bg-white">
          <div className="container-page">
            <CenteredTitle title={t.home.featuredOrganizations} subtitle={t.home.featuredOrganizationsSub} />
            <ul className="grid gap-6 md:grid-cols-6">
              {orgs.map((o, i) => (
                <li
                  key={o.id}
                  className={i < 3 ? "md:col-span-2" : orgs.length === 4 ? "md:col-span-6" : "md:col-span-3"}
                >
                  <OrganizationTile org={o} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="section bg-canvas">
          <div className="container-page">
            <UnderlineTitle title={t.home.recentlyAdded} />
            <ul className="grid gap-[30px] lg:grid-cols-2">
              {recent.map((item) => (
                <li key={`${item.type}-${item.data.id}`}>
                  <ListingRow item={item} locale={locale} labels={labels} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="section bg-white">
          <div className="container-page">
            <CenteredTitle title={t.home.latestArticles} subtitle={t.home.latestArticlesSub} />
            <ul className="grid gap-x-[30px] gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a.id}>
                  <ArticleCard article={a} locale={locale} byLabel={t.common.by} />
                </li>
              ))}
            </ul>
            <div className="mt-14 text-center">
              <a href={localePath(locale, "/articles")} className="btn-primary h-[43px] px-6 text-base font-normal">
                {t.home.viewAllArticles}
              </a>
            </div>
          </div>
        </section>
      )}

      <CtaBand
        title={t.home.ctaTitle}
        text={t.home.ctaText}
        action={
          settings.contactEmail
            ? { href: `mailto:${settings.contactEmail}`, label: t.home.ctaButton }
            : { href: localePath(locale, "/about"), label: t.home.ctaButton }
        }
      />
    </>
  );
}
