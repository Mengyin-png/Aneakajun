import Link from "next/link";
import { ArticleCard, OrganizationCard, PersonCard } from "@/components/site/cards";
import { PageHero } from "@/components/site/hero";
import { MediaPanel } from "@/components/site/media-panel";
import { CenteredTitle, Chip } from "@/components/site/section";
import { ShareButtons } from "@/components/site/share-buttons";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/localize";
import { Markdown } from "@/lib/markdown";
import type { ArticleDetail } from "@/server/queries/articles";
import { SideCard } from "./detail-card";
import { cardLabels } from "./organization-profile";

export function ArticleView({
  article,
  locale,
  t,
  shareUrl,
}: {
  article: ArticleDetail;
  locale: Locale;
  t: Dictionary;
  shareUrl: string;
}) {
  const labels = cardLabels(t);
  const meta = [
    article.author ? `${t.common.by} ${article.author.name}` : null,
    article.publishedAt ? formatDate(article.publishedAt, locale) : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div>
      <PageHero
        title={article.title}
        subtitle={meta}
        crumbs={[
          { href: localePath(locale, "/"), label: t.common.home },
          { href: localePath(locale, "/articles"), label: t.nav.articles },
          ...(article.category
            ? [
                {
                  href: localePath(locale, `/articles?category=${article.category.slug}`),
                  label: article.category.name,
                },
              ]
            : []),
        ]}
      />

      <div className="bg-canvas pb-20">
        <div className="container-page grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Mark the language of fallback (untranslated) content for screen readers. */}
          <article
            lang={article.isFallback ? "en" : undefined}
            className="card-elevated relative z-10 -mt-12 overflow-hidden"
          >
            {article.image && (
              <MediaPanel
                src={article.image.url}
                name={article.title}
                sizes="(min-width: 1024px) 740px, 100vw"
                className="aspect-video w-full"
              />
            )}
            <div className="p-6 sm:p-10">
              {article.excerpt && <p className="mb-8 text-xl leading-relaxed text-black">{article.excerpt}</p>}
              <Markdown source={article.body} className="prose-content" />
              {article.tags.length > 0 && (
                <ul className="mt-10 flex flex-wrap gap-2" aria-label={t.articles.tags}>
                  {article.tags.map((tag) => (
                    <li key={tag.slug}>
                      <Chip href={localePath(locale, `/articles?tag=${tag.slug}`)}>#{tag.name}</Chip>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 border-t border-line pt-6">
                <ShareButtons url={shareUrl} title={article.title} labels={t.articles} />
              </div>
            </div>
          </article>

          <aside className="space-y-8 lg:mt-10">
            {article.author && (
              <SideCard title={t.articles.aboutAuthor}>
                <Link
                  href={localePath(locale, `/people/${article.author.slug}`)}
                  className="group flex items-center gap-4"
                >
                  <MediaPanel
                    src={article.author.photoUrl}
                    name={article.author.name}
                    sizes="56px"
                    className="size-14 shrink-0 rounded-full [&_span]:text-lg"
                  />
                  <span>
                    <span className="block text-brand group-hover:underline">{article.author.name}</span>
                    {article.author.bio && <span className="block text-sm text-ink-soft">{article.author.bio}</span>}
                  </span>
                </Link>
              </SideCard>
            )}
            {article.people.length > 0 && (
              <SideCard title={t.articles.peopleMentioned}>
                <ul className="space-y-6">
                  {article.people.map((p) => (
                    <li key={p.id}>
                      <PersonCard person={p} locale={locale} labels={labels} />
                    </li>
                  ))}
                </ul>
              </SideCard>
            )}
            {article.organizations.length > 0 && (
              <SideCard title={t.articles.organizationsMentioned}>
                <ul className="space-y-6">
                  {article.organizations.map((o) => (
                    <li key={o.id}>
                      <OrganizationCard org={o} locale={locale} labels={labels} />
                    </li>
                  ))}
                </ul>
              </SideCard>
            )}
          </aside>
        </div>

        {article.related.length > 0 && (
          <section className="container-page pt-20">
            <CenteredTitle title={t.articles.related} />
            <ul className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {article.related.map((a) => (
                <li key={a.id}>
                  <ArticleCard article={a} locale={locale} byLabel={t.common.by} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
