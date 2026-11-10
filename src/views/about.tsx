import type { Metadata } from "next";
import Link from "next/link";
import { DetailCard, SideCard } from "@/components/profiles/detail-card";
import { PageHero } from "@/components/site/hero";
import { Icon } from "@/components/site/icons";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getLocalizedSettings } from "@/server/queries/taxonomy";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: "/about", title: t.about.title, description: t.about.intro });
}

export default async function AboutPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const s = await getLocalizedSettings(locale);
  const links: [string, string, string][] = [
    ["/people", t.nav.people, "person"],
    ["/organizations", t.nav.organizations, "building"],
    ["/articles", t.nav.articles, "education"],
    ["/search", t.nav.search, "search"],
  ];

  return (
    <>
      <PageHero
        title={t.about.title}
        subtitle={s.tagline}
        crumbs={[{ href: localePath(locale, "/"), label: t.common.home }, { label: t.nav.about }]}
      />
      <div className="bg-canvas pb-20">
        <div className="container-page grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="relative z-10 -mt-12 space-y-8">
            <DetailCard title={t.about.title}>
              <p className="text-lg leading-relaxed text-ink-soft">{t.about.intro}</p>
              {s.description && <p className="mt-4 leading-relaxed text-ink-soft">{s.description}</p>}
            </DetailCard>
            <DetailCard title={t.about.whatTitle}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {t.about.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-ink-soft">
                    <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-brand" />
                    {p}
                  </li>
                ))}
              </ul>
              <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {links.map(([href, label, icon]) => (
                  <li key={href}>
                    <Link
                      href={localePath(locale, href)}
                      className="group flex flex-col items-center rounded-[7px] border border-line py-5 text-center hover:border-brand"
                    >
                      <Icon name={icon} className="size-9 text-brand" />
                      <span className="mt-2 text-[15px] text-muted group-hover:text-brand">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </DetailCard>
          </div>
          <aside className="lg:mt-10">
            <SideCard title={t.about.contactTitle}>
              <ul className="space-y-3 text-ink-soft">
                {s.contactEmail && (
                  <li>
                    <a href={`mailto:${s.contactEmail}`} className="text-brand hover:underline">
                      {s.contactEmail}
                    </a>
                  </li>
                )}
                {s.contactPhone && <li>{s.contactPhone}</li>}
                {s.address && <li>{s.address}</li>}
              </ul>
            </SideCard>
          </aside>
        </div>
      </div>
    </>
  );
}
