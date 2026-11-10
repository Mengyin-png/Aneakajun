import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizationCard } from "@/components/site/cards";
import { FilterBar } from "@/components/site/filter-bar";
import { cardLabels } from "@/components/profiles/organization-profile";
import { PageHero } from "@/components/site/hero";
import { EmptyState } from "@/components/site/section";
import { Pagination } from "@/components/ui/pagination";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { listOrganizations } from "@/server/queries/organizations";
import { cleanQuery, parsePage, parseSort } from "@/server/queries/shared";
import { categoryOptions, locationOptions } from "@/server/queries/taxonomy";
import { resolveLocale, str, type SearchParams } from "./locale";

type Props = { params: Promise<{ locale: string }>; searchParams: SearchParams };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const filtered = Object.keys(await searchParams).length > 0;
  return pageMetadata({
    locale,
    path: "/organizations",
    title: t.organizations.title,
    description: t.organizations.intro,
    noindex: filtered,
  });
}

export default async function OrganizationsPage({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const sp = await searchParams;
  const q = cleanQuery(str(sp.q));
  const filters = { q, location: str(sp.location), industry: str(sp.industry), category: str(sp.category) };
  const sort = parseSort(str(sp.sort), Boolean(q));

  const [result, locations, industries, categories] = await Promise.all([
    listOrganizations({ ...filters, sort, page: parsePage(str(sp.page)) }, locale),
    locationOptions(locale),
    categoryOptions("INDUSTRY", locale),
    categoryOptions("ORGANIZATION", locale),
  ]);

  return (
    <>
      <PageHero
        title={t.organizations.title}
        subtitle={t.organizations.intro}
        crumbs={[{ href: localePath(locale, "/"), label: t.common.home }, { label: t.organizations.title }]}
      />
      <div className="bg-canvas pb-20">
        <div className="container-page">
          <Suspense>
            <FilterBar
              q={q}
              qPlaceholder={t.common.searchPlaceholder}
              values={filters}
              sort={sort}
              selects={[
                { name: "location", label: t.common.location, options: locations, allLabel: t.common.all },
                { name: "industry", label: t.common.industry, options: industries, allLabel: t.common.all },
                { name: "category", label: t.common.category, options: categories, allLabel: t.common.all },
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

          <p className="mt-10 mb-6 text-[15px] text-ink-soft" aria-live="polite">
            {result.total} {t.common.results}
          </p>
          {result.items.length === 0 ? (
            <EmptyState text={t.common.noResults} />
          ) : (
            <ul className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.items.map((o) => (
                <li key={o.id}>
                  <OrganizationCard org={o} locale={locale} labels={cardLabels(t)} />
                </li>
              ))}
            </ul>
          )}
          <Pagination
            basePath={localePath(locale, "/organizations")}
            params={{ ...filters, sort: str(sp.sort) }}
            page={result.page}
            pageCount={result.pageCount}
            t={t.common}
          />
        </div>
      </div>
    </>
  );
}
