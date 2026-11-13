import type { Metadata } from "next";
import { cardLabels } from "@/components/profiles/organization-profile";
import { ArticleCard, ListingRow, OrganizationTile, PersonCard } from "@/components/site/cards";
import { Carousel, CarouselItem } from "@/components/site/carousel";
import { CategoryStrip } from "@/components/site/category-strip";
import { CtaBand } from "@/components/site/cta-band";
import { JourneyHero } from "@/components/site/journey-hero";
import { GuidanceRow, GuidanceSpotlight, JourneyCard, SectionHeading } from "@/components/site/journey-cards";
import { Skyline } from "@/components/site/skyline";
import { Icon } from "@/components/site/icons";
import { HeroSearch } from "@/components/site/hero-search";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getLatestArticles } from "@/server/queries/articles";
import {
  getFeaturedGuidance,
  getHomeStats,
  getHomepage,
  getJourneys,
  type HomeSectionKey,
} from "@/server/queries/journeys";
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
  const [
    settings,
    people,
    orgs,
    articles,
    categories,
    recentPeople,
    recentOrgs,
    locations,
    industries,
    home,
    journeys,
    guides,
    stats,
  ] = await Promise.all([
    getLocalizedSettings(locale),
    getFeaturedPeople(locale, 8),
    getFeaturedOrganizations(locale, 5),
    getLatestArticles(locale, 3),
    getFeaturedCategories(locale),
    getRecentPeople(locale, 3),
    getRecentOrganizations(locale, 3),
    locationOptions(locale),
    categoryOptions("INDUSTRY", locale),
    getHomepage(locale),
    getJourneys(locale),
    getFeaturedGuidance(locale, 6),
    getHomeStats(),
  ]);
  const labels = cardLabels(t);
  // Interleave recent people and organizations for the "Trending Today"-style grid.
  const recent = recentPeople.flatMap((p, i) => [
    { type: "person" as const, data: p },
    ...(recentOrgs[i] ? [{ type: "organization" as const, data: recentOrgs[i] }] : []),
  ]);

  const enabled = home.sections.filter((s) => s.enabled);
  const [lead, ...moreGuides] = guides;
  const fmt = new Intl.NumberFormat(locale === "km" ? "km-KH" : "en-US");
  const statItems = [
    { n: stats.guides, label: t.journey.statGuides, icon: "doc" },
    { n: stats.people, label: t.journey.statPeople, icon: "person" },
    { n: stats.organizations, label: t.journey.statOrgs, icon: "building" },
    { n: stats.articles, label: t.journey.statArticles, icon: "education" },
  ];
  // The hero selector is the single place to choose Live / Visit / Do business on
  // this page, so this section shows what Aneakajun covers rather than repeating it.
  const blocks: Record<HomeSectionKey, React.ReactNode> = {
    journeys: journeys.length > 0 && (
      <section key="journeys" id="explore" className="section scroll-mt-24 bg-canvas">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.journey.startHere}
            title={t.journey.explore}
            subtitle={t.journey.exploreSub}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((j, i) => (
              <JourneyCard
                key={j.key}
                journey={j}
                locale={locale}
                guidesLabel={t.journey.guides}
                ctaLabel={t.journey.readGuide}
                index={i}
              />
            ))}
          </div>
          <div className="mt-12 sm:mt-16">
            <ul
              aria-label={t.journey.statsTitle}
              className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line shadow-[var(--shadow-card)] sm:grid-cols-4"
            >
              {statItems.map((st) => (
                <li key={st.label} className="flex items-center gap-4 bg-white px-4 py-5 sm:px-6 sm:py-6">
                  <span className="hidden size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand sm:grid">
                    <Icon name={st.icon} className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-2xl font-bold text-black tabular-nums sm:text-[1.7rem] sm:leading-none">
                      {fmt.format(st.n)}
                    </span>
                    <span className="mt-1 block truncate text-sm text-ink-soft">{st.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ),
    guidance: lead && (
      <section key="guidance" id="guidance" className="section scroll-mt-24 bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.journey.guides}
            title={t.journey.popularGuidance}
            subtitle={t.journey.popularGuidanceSub}
          />
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-[30px]">
            <GuidanceSpotlight
              guide={lead}
              locale={locale}
              featuredLabel={t.journey.featured}
              readLabel={t.journey.readGuide}
            />
            {moreGuides.length > 0 && (
              <ol className="grid content-start gap-3.5">
                {moreGuides.map((g, i) => (
                  <li key={g.id}>
                    <GuidanceRow guide={g} locale={locale} n={i + 2} />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>
    ),
    directory: (
      <div key="directory">
        <section className="relative isolate overflow-hidden bg-hero-ink pt-20 pb-40 text-white sm:pt-24 sm:pb-36">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[radial-gradient(70%_80%_at_80%_100%,#09786a_0%,transparent_60%),radial-gradient(60%_60%_at_0%_0%,#0e4f47_0%,transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
          />
          <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 w-full text-[#031210] opacity-60" />
          <div className="container-page">
            <SectionHeading
              align="center"
              tone="dark"
              eyebrow={t.nav.search}
              title={t.journey.discover}
              subtitle={t.journey.discoverSub}
            />
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
          </div>
        </section>
        <div className="bg-canvas pb-16 sm:pb-24">
          <CategoryStrip
            label={t.home.browseCategories}
            items={categories.map((c) => ({ ...c, href: localePath(locale, `/search?category=${c.slug}`) }))}
          />

          {people.length > 0 && (
            <section className="container-page pt-16 sm:pt-20">
              <SectionHeading
                eyebrow={t.nav.people}
                title={t.home.featuredPeople}
                link={{ href: localePath(locale, "/people"), label: t.common.viewAll }}
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
              <SectionHeading
                eyebrow={t.nav.organizations}
                title={t.home.featuredOrganizations}
                subtitle={t.home.featuredOrganizationsSub}
                link={{ href: localePath(locale, "/organizations"), label: t.common.viewAll }}
              />
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {orgs.map((o) => (
                  <li key={o.id} className="transition duration-300 hover:-translate-y-1">
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
              <SectionHeading eyebrow={t.journey.discover} title={t.home.recentlyAdded} />
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
      </div>
    ),
    articles: articles.length > 0 && (
      <section key="articles" className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.nav.articles}
            title={t.home.latestArticles}
            subtitle={t.home.latestArticlesSub}
            link={{ href: localePath(locale, "/articles"), label: t.home.viewAllArticles }}
          />
          <ul className="grid gap-x-[30px] gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <li key={a.id}>
                <ArticleCard article={a} locale={locale} byLabel={t.common.by} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    ),
    resources: home.resources.length > 0 && (
      <section key="resources" className="section bg-canvas">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.journey.officialSource}
            title={t.journey.resources}
            subtitle={t.journey.resourcesSub}
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {home.resources.map((r) => {
              const host = r.url
                .replace(/^https?:\/\//, "")
                .replace(/\/.*$/, "")
                .replace(/^www\./, "");
              return (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col rounded-xl border border-transparent bg-white p-6 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_16px_40px_-18px_rgb(9_120_106/0.45)]"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-sm font-bold text-brand uppercase">
                        {host.slice(0, 2)}
                      </span>
                      <Icon
                        name="arrowRight"
                        className="size-4 -rotate-45 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                      />
                    </span>
                    <span className="mt-5 block text-[17px] leading-snug font-bold text-black group-hover:text-brand">
                      {r.title}
                    </span>
                    {r.description && (
                      <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-soft">{r.description}</span>
                    )}
                    <span className="mt-auto block truncate pt-4 font-mono text-xs text-muted">
                      {host}
                      <span className="sr-only"> ({t.journey.visitSite})</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    ),
    cta: (
      <div key="cta">
        <CtaBand
          title={t.home.ctaTitle}
          text={t.home.ctaText}
          action={
            settings.contactEmail
              ? { href: `mailto:${settings.contactEmail}`, label: t.home.ctaButton }
              : { href: localePath(locale, "/about"), label: t.home.ctaButton }
          }
        />
      </div>
    ),
  };

  return (
    <>
      <JourneyHero
        prefix={home.heroPrefix}
        suffix={home.heroSuffix}
        subtitle={home.heroSubtitle}
        ctaLabel={home.ctaLabel}
        chooseLabel={t.journey.choose}
        scrollLabel={t.journey.scroll}
        videoUrl={home.heroVideoUrl}
        imageUrl={home.heroImageUrl}
        journeys={journeys.map((j) => ({
          key: j.key,
          verb: j.verb,
          title: j.title,
          description: j.description,
          icon: j.icon,
          accentColor: j.accentColor,
          coverUrl: j.coverUrl,
          href: localePath(locale, `/${j.key}`),
        }))}
      />
      <div id="main-content" className="scroll-mt-20">
        {enabled.map((s) => blocks[s.key])}
      </div>
    </>
  );
}
