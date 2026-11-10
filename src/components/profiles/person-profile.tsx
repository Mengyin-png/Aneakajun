import Link from "next/link";
import { PageHero } from "@/components/site/hero";
import { Icon } from "@/components/site/icons";
import { MediaPanel } from "@/components/site/media-panel";
import { Chip } from "@/components/site/section";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/localize";
import { Markdown } from "@/lib/markdown";
import type { PersonProfile } from "@/server/queries/people";
import { DetailCard, SideCard } from "./detail-card";

const years = (start: number | null, end: number | null, present: string) =>
  !start && !end ? null : `${start ?? "?"} – ${end ?? present}`;

export function PersonProfileView({ person, locale, t }: { person: PersonProfile; locale: Locale; t: Dictionary }) {
  const location = person.location
    ? [person.location.name, person.location.parent?.name].filter(Boolean).join(", ")
    : null;
  const links = [
    { label: t.common.website, href: person.links.website },
    { label: "LinkedIn", href: person.links.linkedin },
    { label: "Facebook", href: person.links.facebook },
    { label: "X", href: person.links.x },
    { label: t.common.email, href: person.links.email ? `mailto:${person.links.email}` : null },
  ].filter((i): i is { label: string; href: string } => Boolean(i.href));

  return (
    <article>
      <PageHero
        title={person.name}
        subtitle={person.headline}
        crumbs={[
          { href: localePath(locale, "/"), label: t.common.home },
          { href: localePath(locale, "/people"), label: t.nav.people },
          { label: person.name },
        ]}
      />

      <div className="bg-canvas pb-20">
        <div className="container-page">
          <section className="card-elevated relative z-10 -mt-12 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <MediaPanel
              src={person.photo?.url ?? null}
              name={person.name}
              sizes="128px"
              className="size-28 shrink-0 rounded-full sm:size-32"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                {person.industry && (
                  <Chip href={localePath(locale, `/people?industry=${person.industry.slug}`)}>
                    {person.industry.name}
                  </Chip>
                )}
                {person.category && (
                  <Chip href={localePath(locale, `/people?category=${person.category.slug}`)}>
                    {person.category.name}
                  </Chip>
                )}
              </div>
              <h2 className="mt-3 text-2xl text-brand">{person.name}</h2>
              {location && (
                <p className="mt-1 flex items-center gap-1 text-ink-soft">
                  <Icon name="location" className="size-4" />
                  {location}
                </p>
              )}
            </div>
            {links.length > 0 && (
              <ul className="flex flex-wrap gap-2 sm:max-w-[260px] sm:justify-end">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="btn-primary px-4 py-1.5 font-normal"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              {person.bio && (
                <DetailCard title={t.people.biography}>
                  <Markdown source={person.bio} className="prose-content" />
                </DetailCard>
              )}
              {person.experience.length > 0 && (
                <DetailCard title={t.people.experience}>
                  <ol className="space-y-6 border-l-2 border-brand-soft pl-6">
                    {person.experience.map((e) => (
                      <li key={e.id} className="relative">
                        <span
                          aria-hidden="true"
                          className="absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-white bg-brand"
                        />
                        <p className="text-lg text-black">{e.title}</p>
                        <p className="text-ink-soft">
                          {e.organizationSlug ? (
                            <Link
                              href={localePath(locale, `/organizations/${e.organizationSlug}`)}
                              className="text-brand hover:underline"
                            >
                              {e.organizationName}
                            </Link>
                          ) : (
                            e.organizationName
                          )}
                        </p>
                        {years(e.startYear, e.endYear, t.common.present) && (
                          <p className="text-sm text-muted">{years(e.startYear, e.endYear, t.common.present)}</p>
                        )}
                        {e.description && <p className="mt-1 text-sm text-ink-soft">{e.description}</p>}
                      </li>
                    ))}
                  </ol>
                </DetailCard>
              )}
              {person.education.length > 0 && (
                <DetailCard title={t.people.education}>
                  <ul className="space-y-5">
                    {person.education.map((e) => (
                      <li key={e.id} className="flex gap-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                          <Icon name="education" className="size-5" />
                        </span>
                        <span>
                          <span className="block text-lg text-black">{e.institution}</span>
                          <span className="block text-ink-soft">{[e.degree, e.field].filter(Boolean).join(", ")}</span>
                          {(e.startYear || e.endYear) && (
                            <span className="block text-sm text-muted">
                              {[e.startYear, e.endYear].filter(Boolean).join(" – ")}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </DetailCard>
              )}
            </div>

            <aside className="space-y-8">
              {person.skills.length > 0 && (
                <SideCard title={t.people.skills}>
                  <ul className="flex flex-wrap gap-2">
                    {person.skills.map((s) => (
                      <li key={s.slug}>
                        <Chip href={localePath(locale, `/people?q=${encodeURIComponent(s.name)}`)}>{s.name}</Chip>
                      </li>
                    ))}
                  </ul>
                </SideCard>
              )}
              {person.organizations.length > 0 && (
                <SideCard title={t.people.organizations}>
                  <ul className="space-y-4">
                    {person.organizations.map((o) => (
                      <li key={o.slug}>
                        <Link
                          href={localePath(locale, `/organizations/${o.slug}`)}
                          className="group flex items-center gap-3"
                        >
                          <MediaPanel
                            src={o.logoUrl}
                            name={o.name}
                            sizes="48px"
                            fit="contain"
                            className="size-12 shrink-0 rounded-[6px] [&_span]:text-lg"
                          />
                          <span className="min-w-0">
                            <span className="block text-brand group-hover:underline">{o.name}</span>
                            {o.role && <span className="block text-sm text-ink-soft">{o.role}</span>}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </SideCard>
              )}
              {person.articles.length > 0 && (
                <SideCard title={t.people.articles}>
                  <ul className="space-y-4">
                    {person.articles.map((a) => (
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
