import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/localize";
import type { ArticleCardData } from "@/server/queries/articles";
import type { OpportunityCardData } from "@/server/queries/opportunities";
import type { OrganizationCardData } from "@/server/queries/organizations";
import type { PersonCardData } from "@/server/queries/people";
import { Icon } from "./icons";
import { MediaPanel } from "./media-panel";

type Listing = {
  href: string;
  name: string;
  summary: string | null;
  imageUrl: string | null;
  location: string | null;
  tag: string | null;
  kind: "person" | "organization";
};

const personListing = (p: PersonCardData, locale: Locale): Listing => ({
  href: localePath(locale, `/people/${p.slug}`),
  name: p.name,
  summary: p.headline,
  imageUrl: p.photoUrl,
  location: p.location?.name ?? null,
  tag: p.industry?.name ?? null,
  kind: "person",
});

const orgListing = (o: OrganizationCardData, locale: Locale): Listing => ({
  href: localePath(locale, `/organizations/${o.slug}`),
  name: o.name,
  summary: o.tagline,
  imageUrl: o.logoUrl,
  location: o.location?.name ?? null,
  tag: o.industry?.name ?? null,
  kind: "organization",
});

function Location({ text, className = "" }: { text: string | null; className?: string }) {
  if (!text) return null;
  return (
    <p className={`flex items-center gap-1 text-sm text-ink-soft ${className}`}>
      <Icon name="location" className="size-3.5 shrink-0" />
      <span className="truncate">{text}</span>
    </p>
  );
}

function KindBadge({ kind, label }: { kind: Listing["kind"]; label: string }) {
  return (
    <span title={label} className="grid size-[30px] shrink-0 place-items-center rounded-full bg-canvas text-ink-soft">
      <Icon name={kind === "person" ? "person" : "building"} className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** "Featured Ads" card: image on top, pill + type badge, teal title, location, summary. */
function VerticalCard({ l, kindLabel, cta }: { l: Listing; kindLabel: string; cta: string }) {
  return (
    <Link
      href={l.href}
      className="card-elevated group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5"
    >
      <MediaPanel
        src={l.imageUrl}
        name={l.name}
        sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 90vw"
        className="h-[150px] w-full"
        fit={l.kind === "organization" ? "contain" : "cover"}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          {l.tag ? <span className="pill truncate">{l.tag}</span> : <span />}
          <KindBadge kind={l.kind} label={kindLabel} />
        </div>
        <h3 className="text-lg leading-snug text-brand group-hover:underline">{l.name}</h3>
        <Location text={l.location} className="mt-1.5" />
        {l.summary && <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{l.summary}</p>}
        <span className="mt-auto pt-4 font-bold text-brand">{cta} →</span>
      </div>
    </Link>
  );
}

export function PersonCard({ person, locale, labels }: { person: PersonCardData; locale: Locale; labels: CardLabels }) {
  return <VerticalCard l={personListing(person, locale)} kindLabel={labels.person} cta={labels.viewProfile} />;
}

export function OrganizationCard({
  org,
  locale,
  labels,
}: {
  org: OrganizationCardData;
  locale: Locale;
  labels: CardLabels;
}) {
  return <VerticalCard l={orgListing(org, locale)} kindLabel={labels.organization} cta={labels.viewProfile} />;
}

/** "Popular Ads" tile: dark image tile with teal pill and white title. */
export function OrganizationTile({
  org,
  locale,
  className = "",
}: {
  org: OrganizationCardData;
  locale: Locale;
  className?: string;
}) {
  const l = orgListing(org, locale);
  return (
    <Link href={l.href} className={`group relative block h-60 overflow-hidden rounded-[4px] ${className}`}>
      <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.03]">
        <MediaPanel
          src={l.imageUrl}
          name={l.name}
          sizes="(min-width: 1024px) 540px, 100vw"
          className="size-full"
          dark
          fit="cover"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        {l.tag && (
          <span className="mb-2.5 inline-flex rounded-full bg-brand px-4 py-1.5 text-[13px] text-white">{l.tag}</span>
        )}
        <h3 className="text-xl leading-snug text-white">{l.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-white/85">{[l.location, l.summary].filter(Boolean).join(" · ")}</p>
      </div>
    </Link>
  );
}

/** "Trending Today" row: image left, details right. */
export function ListingRow({
  item,
  locale,
  labels,
}: {
  item: { type: "person"; data: PersonCardData } | { type: "organization"; data: OrganizationCardData };
  locale: Locale;
  labels: CardLabels;
}) {
  const l = item.type === "person" ? personListing(item.data, locale) : orgListing(item.data, locale);
  return (
    <Link href={l.href} className="card-elevated group flex h-full overflow-hidden transition hover:-translate-y-0.5">
      <MediaPanel
        src={l.imageUrl}
        name={l.name}
        sizes="230px"
        className="w-[38%] max-w-[230px] shrink-0 self-stretch"
        fit={l.kind === "organization" ? "contain" : "cover"}
      />
      <div className="min-w-0 flex-1 p-5 sm:p-[30px]">
        <div className="mb-3 flex items-center justify-between gap-2">
          {l.tag ? <span className="pill truncate">{l.tag}</span> : <span />}
          <KindBadge kind={l.kind} label={l.kind === "person" ? labels.person : labels.organization} />
        </div>
        <h3 className="text-lg leading-snug text-brand group-hover:underline">{l.name}</h3>
        <Location text={l.location} className="mt-1" />
        {l.summary && <p className="mt-3 line-clamp-2 text-sm font-bold text-brand">{l.summary}</p>}
      </div>
    </Link>
  );
}

/** "Our Blog" post: image, title, meta line (by · date · category link), excerpt. */
export function ArticleCard({
  article,
  locale,
  byLabel,
}: {
  article: ArticleCardData;
  locale: Locale;
  byLabel: string;
}) {
  const href = localePath(locale, `/articles/${article.slug}`);
  return (
    <article className="flex h-full flex-col">
      <Link href={href} className="block overflow-hidden rounded-[4px]" tabIndex={-1} aria-hidden="true">
        <MediaPanel
          src={article.imageUrl}
          name={article.title}
          sizes="(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[350/243] w-full transition duration-500 hover:scale-[1.02]"
        />
      </Link>
      <h3 className="mt-6 text-xl leading-snug text-black">
        <Link href={href} className="hover:text-brand">
          {article.title}
        </Link>
      </h3>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
        {article.authorName && (
          <span>
            {byLabel} {article.authorName}
          </span>
        )}
        {article.authorName && article.publishedAt && <span aria-hidden="true">•</span>}
        {article.publishedAt && (
          <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt, locale)}</time>
        )}
        {article.category && (
          <>
            <span aria-hidden="true">•</span>
            <Link
              href={localePath(locale, `/articles?category=${article.category.slug}`)}
              className="text-brand underline underline-offset-2"
            >
              {article.category.name}
            </Link>
          </>
        )}
      </p>
      {article.excerpt && <p className="mt-4 leading-relaxed text-ink-soft">{article.excerpt}</p>}
    </article>
  );
}

/** Opportunity listing in the same row style. */
export function OpportunityCard({
  item,
  locale,
  labels,
}: {
  item: OpportunityCardData;
  locale: Locale;
  labels: { apply: string; deadline: string };
}) {
  return (
    <article className="card-elevated flex h-full flex-col p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        {item.category ? <span className="pill">{item.category}</span> : <span />}
        <span className="grid size-[30px] place-items-center rounded-full bg-canvas text-ink-soft">
          <Icon name="briefcase" className="size-4" />
        </span>
      </div>
      <h3 className="text-lg leading-snug text-brand">{item.title}</h3>
      {item.organization && (
        <p className="mt-1 text-sm text-ink-soft">
          <Link
            href={localePath(locale, `/organizations/${item.organization.slug}`)}
            className="hover:text-brand hover:underline"
          >
            {item.organization.name}
          </Link>
        </p>
      )}
      <Location text={item.location} className="mt-1" />
      {item.description && <p className="mt-3 line-clamp-3 text-sm text-ink-soft">{item.description}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        {item.deadline ? (
          <span className="text-sm font-bold text-brand">
            {labels.deadline}: {formatDate(item.deadline, locale)}
          </span>
        ) : (
          <span />
        )}
        {item.applyUrl && (
          <a href={item.applyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary px-4 py-1.5">
            {labels.apply} ↗
          </a>
        )}
      </div>
    </article>
  );
}

export type CardLabels = { person: string; organization: string; viewProfile: string };
