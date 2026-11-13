import Link from "next/link";
import { PersonCard, type CardLabels } from "@/components/site/cards";
import { PageHero } from "@/components/site/hero";
import { Icon } from "@/components/site/icons";
import { MediaPanel } from "@/components/site/media-panel";
import { Chip } from "@/components/site/section";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/localize";
import { Markdown } from "@/lib/markdown";
import type { OrganizationProfile } from "@/server/queries/organizations";
import { DetailCard, SideCard } from "./detail-card";

export function cardLabels(t: Dictionary): CardLabels {
  return { person: t.search.typePerson, organization: t.search.typeOrganization, viewProfile: t.common.viewProfile };
}

export function OrganizationProfileView({
  org,
  locale,
  t,
}: {
  org: OrganizationProfile;
  locale: Locale;
  t: Dictionary;
}) {
  const location = org.location ? [org.location.name, org.location.parent?.name].filter(Boolean).join(", ") : null;
  const keyPeople = org.members.filter((m) => m.isKeyPerson);
  const otherMembers = org.members.filter((m) => !m.isKeyPerson);
  const contact = [
    { label: t.common.website, value: org.contact.website, href: org.contact.website },
    { label: t.common.email, value: org.contact.email, href: org.contact.email ? `mailto:${org.contact.email}` : null },
    {
      label: t.common.phone,
      value: org.contact.phone,
      href: org.contact.phone ? `tel:${org.contact.phone.replace(/[^\d+]/g, "")}` : null,
    },
    { label: "Facebook", value: org.contact.facebook ? "Facebook" : null, href: org.contact.facebook },
    { label: "LinkedIn", value: org.contact.linkedin ? "LinkedIn" : null, href: org.contact.linkedin },
  ].filter((c): c is { label: string; value: string; href: string } => Boolean(c.value && c.href));
  const labels = cardLabels(t);

  return (
    <article>
      <PageHero
        title={org.name}
        subtitle={org.tagline}
        crumbs={[
          { href: localePath(locale, "/"), label: t.common.home },
          { href: localePath(locale, "/organizations"), label: t.nav.organizations },
          { label: org.name },
        ]}
      />

      <div className="bg-canvas pb-20">
        <div className="container-page">
          <section className="card-elevated relative z-10 -mt-8 sm:-mt-12 overflow-hidden">
            {org.coverUrl && (
              <MediaPanel
                src={org.coverUrl}
                name={org.name}
                alt={`${org.name} cover`}
                sizes="(min-width: 1140px) 1140px, 100vw"
                className="h-44 w-full sm:h-56"
              />
            )}
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
              <MediaPanel
                src={org.logoUrl}
                name={org.name}
                alt={`${org.name} logo`}
                sizes="112px"
                fit="contain"
                className="size-24 shrink-0 rounded-[7px] border border-line sm:size-28"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {org.industry && (
                    <Chip href={localePath(locale, `/organizations?industry=${org.industry.slug}`)}>
                      {org.industry.name}
                    </Chip>
                  )}
                  {org.category && (
                    <Chip href={localePath(locale, `/organizations?category=${org.category.slug}`)}>
                      {org.category.name}
                    </Chip>
                  )}
                </div>
                <p className="mt-3 text-2xl font-bold text-brand">{org.name}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
                  {location && (
                    <span className="flex items-center gap-1">
                      <Icon name="location" className="size-4" />
                      {location}
                    </span>
                  )}
                  {org.foundedYear && (
                    <span className="font-bold text-brand">
                      {t.organizations.founded} {org.foundedYear}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              {org.description && (
                <DetailCard title={t.organizations.about}>
                  <Markdown source={org.description} className="prose-content" />
                </DetailCard>
              )}
              {(org.mission || org.vision) && (
                <div className="grid gap-8 sm:grid-cols-2">
                  {org.mission && (
                    <DetailCard title={t.organizations.mission}>
                      <p className="leading-relaxed text-ink-soft">{org.mission}</p>
                    </DetailCard>
                  )}
                  {org.vision && (
                    <DetailCard title={t.organizations.vision}>
                      <p className="leading-relaxed text-ink-soft">{org.vision}</p>
                    </DetailCard>
                  )}
                </div>
              )}
              {org.activities.length > 0 && (
                <DetailCard title={t.organizations.activities}>
                  <ul className="space-y-3">
                    {org.activities.map((a) => (
                      <li key={a} className="flex items-start gap-3 text-ink-soft">
                        <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-brand" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </DetailCard>
              )}
              {keyPeople.length > 0 && (
                <section>
                  <h2 className="mb-6 text-[1.35rem] font-normal text-black">{t.organizations.keyPeople}</h2>
                  <ul className="grid gap-6 sm:grid-cols-2">
                    {keyPeople.map((m) => (
                      <li key={m.person.id}>
                        <PersonCard
                          person={{ ...m.person, headline: m.role ?? m.person.headline }}
                          locale={locale}
                          labels={labels}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {otherMembers.length > 0 && (
                <section>
                  <h2 className="mb-6 text-[1.35rem] font-normal text-black">{t.organizations.members}</h2>
                  <ul className="grid gap-6 sm:grid-cols-2">
                    {otherMembers.map((m) => (
                      <li key={m.person.id}>
                        <PersonCard
                          person={{ ...m.person, headline: m.role ?? m.person.headline }}
                          locale={locale}
                          labels={labels}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="space-y-8">
              {(contact.length > 0 || org.address) && (
                <SideCard title={t.organizations.contact}>
                  <dl className="space-y-4">
                    {contact.map((c) => (
                      <div key={c.label}>
                        <dt className="text-sm text-muted">{c.label}</dt>
                        <dd>
                          <a
                            href={c.href}
                            target={c.href.startsWith("http") ? "_blank" : undefined}
                            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="break-all text-brand hover:underline"
                          >
                            {c.value}
                            {c.href.startsWith("http") && <span className="sr-only"> ({t.journey.visitSite})</span>}
                          </a>
                        </dd>
                      </div>
                    ))}
                    {org.address && (
                      <div>
                        <dt className="text-sm text-muted">{t.common.location}</dt>
                        <dd className="text-ink-soft">{org.address}</dd>
                      </div>
                    )}
                  </dl>
                </SideCard>
              )}
              {org.articles.length > 0 && (
                <SideCard title={t.organizations.articles}>
                  <ul className="space-y-4">
                    {org.articles.map((a) => (
                      <li key={a.slug}>
                        <Link href={localePath(locale, `/articles/${a.slug}`)} className="text-black hover:text-brand">
                          {a.title}
                        </Link>
                        {a.publishedAt && <p className="text-sm text-muted">{formatDate(a.publishedAt, locale)}</p>}
                      </li>
                    ))}
                  </ul>
                </SideCard>
              )}
            </aside>
          </div>
        </div>
      </div>
    </article>
  );
}
