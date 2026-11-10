import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleCard } from "@/components/site/cards";
import { FilterBar } from "@/components/site/filter-bar";
import { PageHero } from "@/components/site/hero";
import { EmptyState } from "@/components/site/section";
import { Pagination } from "@/components/ui/pagination";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { listArticles } from "@/server/queries/articles";
import { cleanQuery, parsePage, parseSort } from "@/server/queries/shared";
import { categoryOptions, tagOptions } from "@/server/queries/taxonomy";
import { resolveLocale, str, type SearchParams } from "./locale";

type Props = { params: Promise<{ locale: string }>; searchParams: SearchParams };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const filtered = Object.keys(await searchParams).length > 0;
  return pageMetadata({
    locale,
    path: "/articles",
    title: t.articles.title,
    description: t.articles.intro,
    noindex: filtered,
  });
}

export default async function ArticlesPage({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const sp = await searchParams;
  const q = cleanQuery(str(sp.q));
  const filters = { q, category: str(sp.category), tag: str(sp.tag) };
  const sort = parseSort(str(sp.sort), Boolean(q));

  const [result, categories, tags] = await Promise.all([
    listArticles({ ...filters, sort, page: parsePage(str(sp.page)) }, locale),
    categoryOptions("ARTICLE", locale),
    tagOptions(locale),
  ]);

  return (
    <>
      <PageHero
        title={t.articles.title}
        subtitle={t.articles.intro}
        crumbs={[{ href: localePath(locale, "/"), label: t.common.home }, { label: t.articles.title }]}
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
                { name: "category", label: t.common.category, options: categories, allLabel: t.common.all },
                { name: "tag", label: t.articles.tags, options: tags, allLabel: t.common.all },
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
            <ul className="grid gap-x-[30px] gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((a) => (
                <li key={a.id}>
                  <ArticleCard article={a} locale={locale} byLabel={t.common.by} />
                </li>
              ))}
            </ul>
          )}
          <Pagination
            basePath={localePath(locale, "/articles")}
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
