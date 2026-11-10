import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleCard, OpportunityCard, OrganizationCard, PersonCard } from "@/components/site/cards";
import { FilterBar } from "@/components/site/filter-bar";
import { cardLabels } from "@/components/profiles/organization-profile";
import { PageHero } from "@/components/site/hero";
import { EmptyState } from "@/components/site/section";
import { Pagination } from "@/components/ui/pagination";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { globalSearch, parseSearchType } from "@/server/queries/search";
import { cleanQuery, parsePage, parseSort } from "@/server/queries/shared";
import { categoryOptions, locationOptions } from "@/server/queries/taxonomy";
import { resolveLocale, str, type SearchParams } from "./locale";

type Props = { params: Promise<{ locale: string }>; searchParams: SearchParams };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  // Search result pages should not be indexed.
  return pageMetadata({ locale, path: "/search", title: t.search.title, noindex: true });
}

export default async function SearchPage({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const sp = await searchParams;
  const q = cleanQuery(str(sp.q));
  const type = parseSearchType(str(sp.type));
  const location = str(sp.location);
  const category = str(sp.category);
  const sort = parseSort(str(sp.sort), Boolean(q));

  const [result, locations, industries, articleCats, peopleCats, orgCats] = await Promise.all([
    globalSearch({ q, type, location, category, sort, page: parsePage(str(sp.page)) }, locale),
    locationOptions(locale),
    categoryOptions("INDUSTRY", locale),
    categoryOptions("ARTICLE", locale),
    categoryOptions("PEOPLE", locale),
    categoryOptions("ORGANIZATION", locale),
  ]);

  const typeTabs = [
    {
      value: "all",
      label: t.search.typeAll,
      count: result.counts.person + result.counts.organization + result.counts.article + result.counts.opportunity,
    },
    { value: "person", label: t.nav.people, count: result.counts.person },
    { value: "organization", label: t.nav.organizations, count: result.counts.organization },
    { value: "article", label: t.nav.articles, count: result.counts.article },
    { value: "opportunity", label: t.nav.opportunities, count: result.counts.opportunity },
  ];
  const tabHref = (value: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (value !== "all") p.set("type", value);
    if (location) p.set("location", location);
    if (category) p.set("category", category);
    if (str(sp.sort)) p.set("sort", str(sp.sort)!);
    const qs = p.toString();
    return localePath(locale, `/search${qs ? `?${qs}` : ""}`);
  };

  return (
    <>
      <PageHero
        title={q ? `${t.search.resultsFor} “${q}”` : t.search.title}
        crumbs={[{ href: localePath(locale, "/"), label: t.common.home }, { label: t.search.title }]}
      />
      <div className="bg-canvas pb-20">
        <div className="container-page">
          <Suspense>
            <FilterBar
              q={q}
              qPlaceholder={t.common.searchPlaceholder}
              values={{ location, category, type: type === "all" ? undefined : type }}
              sort={sort}
              selects={[
                {
                  name: "type",
                  label: t.search.type,
                  allLabel: t.search.typeAll,
                  options: [
                    { value: "person", label: t.nav.people },
                    { value: "organization", label: t.nav.organizations },
                    { value: "article", label: t.nav.articles },
                    { value: "opportunity", label: t.nav.opportunities },
                  ],
                },
                { name: "location", label: t.common.location, options: locations, allLabel: t.common.all },
                {
                  name: "category",
                  label: t.common.category,
                  allLabel: t.common.all,
                  options: [...industries, ...peopleCats, ...orgCats, ...articleCats],
                },
              ]}
              sortOptions={[
                ...(q ? [{ value: "relevance", label: t.common.relevance }] : []),
                { value: "newest", label: t.common.newest },
                { value: "alpha", label: t.common.alphabetical },
              ]}
              labels={{
                search: t.common.search,
                sort: t.common.sort,
                apply: t.common.apply,
                clear: t.common.clear,
                filters: t.common.filters,
              }}
            />
          </Suspense>

          <nav aria-label={t.search.type} className="mt-6 flex flex-wrap gap-2">
            {typeTabs.map((tab) => (
              <Link
                key={tab.value}
                href={tabHref(tab.value)}
                aria-current={type === tab.value ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-sm ${
                  type === tab.value
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-ink-soft hover:border-brand/40"
                }`}
              >
                {tab.label} <span className="opacity-70">({tab.count})</span>
              </Link>
            ))}
          </nav>

          <p className="mt-6 mb-6 text-[15px] text-ink-soft" aria-live="polite">
            {result.total} {t.common.results}
          </p>

          {result.items.length === 0 ? (
            <EmptyState text={t.common.noResults} />
          ) : (
            <ul className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.items.map((r) => (
                <li key={`${r.type}-${r.data.id}`} className="flex flex-col">
                  <span className="mb-2 text-[13px] text-muted">
                    {r.type === "person"
                      ? t.search.typePerson
                      : r.type === "organization"
                        ? t.search.typeOrganization
                        : r.type === "opportunity"
                          ? t.search.typeOpportunity
                          : t.search.typeArticle}
                  </span>
                  {r.type === "person" ? (
                    <PersonCard person={r.data} locale={locale} labels={cardLabels(t)} />
                  ) : r.type === "organization" ? (
                    <OrganizationCard org={r.data} locale={locale} labels={cardLabels(t)} />
                  ) : r.type === "opportunity" ? (
                    <OpportunityCard item={r.data} locale={locale} labels={t.opportunities} />
                  ) : (
                    <div className="card-elevated h-full p-5">
                      <ArticleCard article={r.data} locale={locale} byLabel={t.common.by} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Pagination
            basePath={localePath(locale, "/search")}
            params={{ q, type: type === "all" ? undefined : type, location, category, sort: str(sp.sort) }}
            page={result.page}
            pageCount={result.pageCount}
            t={t.common}
          />
        </div>
      </div>
    </>
  );
}
