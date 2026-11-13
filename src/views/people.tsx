import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PersonCard } from "@/components/site/cards";
import { FilterBar } from "@/components/site/filter-bar";
import { cardLabels } from "@/components/profiles/organization-profile";
import { PageHero } from "@/components/site/hero";
import { EmptyState } from "@/components/site/section";
import { Pagination } from "@/components/ui/pagination";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { listPeople } from "@/server/queries/people";
import { cleanQuery, parsePage, parseSort } from "@/server/queries/shared";
import { categoryOptions, locationOptions } from "@/server/queries/taxonomy";
import { resolveLocale, str, type SearchParams } from "./locale";

type Props = { params: Promise<{ locale: string }>; searchParams: SearchParams };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const filtered = Object.keys(await searchParams).length > 0;
  // Filtered/paginated variants are not indexed; the canonical points at the base listing.
  return pageMetadata({
    locale,
    path: "/people",
    title: t.people.title,
    description: t.people.intro,
    noindex: filtered,
  });
}

export default async function PeoplePage({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const sp = await searchParams;
  const q = cleanQuery(str(sp.q));
  const filters = { q, location: str(sp.location), industry: str(sp.industry), category: str(sp.category) };
  const sort = parseSort(str(sp.sort), Boolean(q));

  const [result, locations, industries, categories] = await Promise.all([
    listPeople({ ...filters, sort, page: parsePage(str(sp.page)) }, locale),
    locationOptions(locale),
    categoryOptions("INDUSTRY", locale),
    categoryOptions("PEOPLE", locale),
  ]);

  const activeFilters = [
    q ? { key: "q", label: `"${q}"` } : null,
    filters.location
      ? {
          key: "location",
          label: `${t.common.location}: ${locations.find((l) => l.value === filters.location)?.label ?? filters.location}`,
        }
      : null,
    filters.industry
      ? {
          key: "industry",
          label: `${t.common.industry}: ${industries.find((i) => i.value === filters.industry)?.label ?? filters.industry}`,
        }
      : null,
    filters.category
      ? {
          key: "category",
          label: `${t.common.category}: ${categories.find((c) => c.value === filters.category)?.label ?? filters.category}`,
        }
      : null,
  ].filter((f): f is { key: string; label: string } => Boolean(f));

  const removeFilterHref = (key: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (k !== key && v) p.set(k, v);
    }
    if (str(sp.sort)) p.set("sort", str(sp.sort)!);
    const qs = p.toString();
    return localePath(locale, `/people${qs ? `?${qs}` : ""}`);
  };

  return (
    <>
      <PageHero
        title={t.people.title}
        subtitle={t.people.intro}
        crumbs={[{ href: localePath(locale, "/"), label: t.common.home }, { label: t.people.title }]}
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

          <div className="mt-8 mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[15px] font-medium text-ink-soft" aria-live="polite">
              {result.total} {t.common.results}
            </p>
            {activeFilters.length > 0 && (
              <ul className="flex flex-wrap items-center gap-2" aria-label={t.common.filters}>
                {activeFilters.map((f) => (
                  <li key={f.key}>
                    <Link
                      href={removeFilterHref(f.key)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-soft shadow-xs transition hover:border-brand hover:text-brand"
                    >
                      <span>{f.label}</span>
                      <span aria-hidden="true" className="font-bold text-muted hover:text-brand">✕</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {result.items.length === 0 ? (
            <EmptyState text={t.common.noResults} />
          ) : (
            <ul className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.items.map((p) => (
                <li key={p.id}>
                  <PersonCard person={p} locale={locale} labels={cardLabels(t)} />
                </li>
              ))}
            </ul>
          )}
          <Pagination
            basePath={localePath(locale, "/people")}
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
