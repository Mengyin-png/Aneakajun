import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/admin-table";
import { ArticleView } from "@/components/profiles/article-view";
import { OrganizationProfileView } from "@/components/profiles/organization-profile";
import { PersonProfileView } from "@/components/profiles/person-profile";
import { requireUser } from "@/lib/auth/guard";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { siteUrl } from "@/lib/seo";
import { getArticle } from "@/server/queries/articles";
import { getGuidanceForPreview, getRelatedGuidance } from "@/server/queries/journeys";
import { GuidanceBody } from "@/components/site/guidance-body";
import { PageHero } from "@/components/site/hero";
import { getOrganizationProfile } from "@/server/queries/organizations";
import { getPersonProfile } from "@/server/queries/people";

export const metadata = { title: "Preview" };

/** Renders draft content with the public components. Admin-only and never indexed. */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ locale?: string; guest?: string }>;
}) {
  await requireUser();
  const { type, id } = await params;
  const sp = await searchParams;
  const lp = sp.locale;
  const guest = sp.guest === "1";
  const locale: Locale = isLocale(lp) ? lp : "en";
  const t = getDictionary(locale);

  let content: React.ReactNode = null;
  let status: string | null = null;
  if (type === "person") {
    const p = await getPersonProfile({ id }, locale, true);
    if (!p) notFound();
    status = p.status;
    content = <PersonProfileView person={p} locale={locale} t={t} />;
  } else if (type === "organization") {
    const o = await getOrganizationProfile({ id }, locale, true);
    if (!o) notFound();
    status = o.status;
    content = <OrganizationProfileView org={o} locale={locale} t={t} />;
  } else if (type === "article") {
    const a = await getArticle({ id }, locale, true);
    if (!a) notFound();
    status = a.status;
    content = <ArticleView article={a} locale={locale} t={t} shareUrl={`${siteUrl()}/articles/${a.slug}`} />;
  } else if (type === "guidance") {
    const g = await getGuidanceForPreview(id, locale);
    if (!g) notFound();
    status = g.status;
    const related = await getRelatedGuidance(g.journeyId, g.id, locale);
    content = (
      <>
        <PageHero title={g.title} crumbs={[{ label: g.journeyTitle }, { label: g.title }]} />
        <GuidanceBody
          guide={g}
          related={related}
          locale={locale}
          t={t}
          fullAccess={!guest}
          signInHref="#"
          formHref={`/${g.journeyKey}/form`}
          previewBanner={
            <p className="mb-4 flex flex-wrap gap-3 rounded bg-white p-3 text-sm shadow-[var(--shadow-card)]">
              <span>{guest ? "Showing the guest view (first 40%)." : "Showing the signed-in member view."}</span>
              <Link href={`?locale=${locale}${guest ? "" : "&guest=1"}`} className="text-brand underline">
                {guest ? "Show member view" : "Show guest view"}
              </Link>
            </p>
          }
        />
      </>
    );
  } else notFound();

  return (
    <div className="-mx-4 -my-6 sm:-mx-6">
      <div className="sticky top-14 z-20 flex flex-wrap items-center gap-3 border-b border-warning/30 bg-warning/10 px-4 py-2 text-sm sm:px-6">
        <strong>Preview</strong>
        {status && <StatusBadge status={status as "DRAFT"} />}
        <span className="text-ink-soft">Exactly how this will look when published.</span>
        <span className="ml-auto flex gap-2">
          <Link href={`?locale=en`} className={`rounded px-2 py-0.5 ${locale === "en" ? "bg-white font-medium" : ""}`}>
            English
          </Link>
          <Link href={`?locale=km`} className={`rounded px-2 py-0.5 ${locale === "km" ? "bg-white font-medium" : ""}`}>
            ខ្មែរ
          </Link>
        </span>
      </div>
      <div lang={locale} className="bg-canvas">
        {content}
      </div>
    </div>
  );
}
