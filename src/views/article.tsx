import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArticleView } from "@/components/profiles/article-view";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { plainText } from "@/lib/text";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getArticle } from "@/server/queries/articles";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string; slug: string }> };

const load = cache(async (slug: string, locale: "en" | "km") => getArticle({ slug }, locale));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const article = await load((await params).slug, locale);
  if (!article) return {};
  const meta = pageMetadata({
    locale,
    path: `/articles/${article.slug}`,
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || plainText(article.body),
    image: article.image?.url,
    type: "article",
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      tags: article.tags.map((t) => t.name),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const article = await load((await params).slug, locale);
  if (!article) notFound();
  return (
    <ArticleView
      article={article}
      locale={locale}
      t={getDictionary(locale)}
      shareUrl={`${siteUrl()}${localePath(locale, `/articles/${article.slug}`)}`}
    />
  );
}
