import Link from "next/link";
import { formatDate } from "@/lib/i18n/localize";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { GuidanceCardData, JourneyData } from "@/server/queries/journeys";
import { Icon } from "./icons";

export const guidanceHref = (locale: Locale, g: { journeyKey: string; slug: string }) =>
  localePath(locale, `/${g.journeyKey}/${g.slug}`);

const tint = (c: string, amount: number) => `color-mix(in oklab, ${c} ${amount}%, white)`;

/** Editorial section heading: small coloured eyebrow, large title, optional link. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  link,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  link?: { href: string; label: string };
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const center = align === "center";
  return (
    <div
      className={`mb-10 flex flex-col gap-4 sm:mb-14 ${center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}
    >
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p
            className={`mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase [:lang(km)_&]:tracking-normal [:lang(km)_&]:normal-case ${tone === "dark" ? "text-[#7fe0cf]" : "text-brand"}`}
          >
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {eyebrow}
          </p>
        )}
        <h2
          className={`text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.15] font-normal tracking-[-0.01em] ${tone === "dark" ? "text-white" : "text-black"}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-3 text-[1.05rem] leading-relaxed ${tone === "dark" ? "text-white/75" : "text-ink-soft"}`}>
            {subtitle}
          </p>
        )}
      </div>
      {link && (
        <Link
          href={link.href}
          className={`group/more inline-flex shrink-0 items-center gap-2 text-[15px] font-bold ${tone === "dark" ? "text-white" : "text-brand"}`}
        >
          {link.label}
          <Icon name="arrowRight" className="size-4 transition-transform group-hover/more:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

/** Tall journey card (Live / Visit / Business) with its own colour identity. */
export function JourneyCard({
  journey,
  locale,
  guidesLabel,
  ctaLabel,
  index,
}: {
  journey: JourneyData;
  locale: Locale;
  guidesLabel: string;
  ctaLabel: string;
  index?: number;
}) {
  const c = journey.accentColor;
  return (
    <Link
      href={localePath(locale, `/${journey.key}`)}
      className="group relative isolate flex h-full min-h-[340px] flex-col overflow-hidden rounded-2xl p-7 text-white shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)] transition duration-500 ease-(--ease-out-soft) hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgb(0_0_0/0.55)] sm:min-h-[380px] sm:p-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 transition-transform duration-700 ease-(--ease-out-soft) group-hover:scale-105"
        style={{
          background: journey.coverUrl
            ? `center / cover no-repeat url(${JSON.stringify(journey.coverUrl)})`
            : `radial-gradient(90% 70% at 85% 0%, ${tint(c, 70)} 0%, transparent 60%), linear-gradient(160deg, ${c} 0%, color-mix(in oklab, ${c} 55%, #031210) 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
      />
      {/* Oversized icon watermark */}
      <Icon
        name={journey.icon}
        className="pointer-events-none absolute -right-6 -bottom-6 -z-10 size-48 text-white/[0.08] transition duration-700 ease-(--ease-out-soft) group-hover:-rotate-6 group-hover:text-white/[0.13]"
      />
      <div className="flex items-start justify-between">
        <span className="grid size-14 place-items-center rounded-2xl bg-white/95 shadow-lg" style={{ color: c }}>
          <Icon name={journey.icon} className="size-7" />
        </span>
        {index !== undefined && (
          <span className="font-mono text-sm tracking-widest text-white/60">{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <div className="mt-auto pt-10">
        <h3 className="text-[1.75rem] leading-tight font-bold">{journey.title}</h3>
        {journey.description && (
          <p className="mt-3 line-clamp-3 leading-relaxed text-white/85">{journey.description}</p>
        )}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/20 pt-5 text-sm">
          <span className="text-white/80">
            <strong className="text-lg text-white tabular-nums">{journey.guideCount}</strong> {guidesLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 py-1.5 pr-1.5 pl-4 font-bold backdrop-blur-sm transition group-hover:bg-white group-hover:text-black">
            {ctaLabel}
            <span
              className="grid size-7 place-items-center rounded-full bg-white text-black transition group-hover:translate-x-0.5"
              style={{ color: c }}
            >
              <Icon name="arrowRight" className="size-4" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Guidance article card (used on journey pages and as related guidance). */
export function GuidanceCard({
  guide,
  locale,
  reviewedLabel,
}: {
  guide: GuidanceCardData;
  locale: Locale;
  reviewedLabel?: string;
}) {
  return (
    <Link
      href={guidanceHref(locale, guide)}
      className="group flex h-full flex-col overflow-hidden rounded-[7px] bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgb(0_0_0/0.25)]"
    >
      <span
        className="block h-1.5 origin-left transition-transform duration-500 group-hover:scale-x-100 sm:scale-x-[0.35]"
        style={{ background: guide.accentColor }}
        aria-hidden="true"
      />
      <span className="flex flex-1 flex-col p-6">
        <span className="text-xs font-bold tracking-wide uppercase" style={{ color: guide.accentColor }}>
          {guide.journeyTitle}
        </span>
        <span className="mt-2 text-lg leading-snug text-black transition-colors group-hover:text-brand">
          {guide.title}
        </span>
        {guide.summary && <span className="mt-2 line-clamp-3 text-[15px] text-ink-soft">{guide.summary}</span>}
        {reviewedLabel && guide.lastReviewedAt && (
          <span className="mt-auto pt-4 text-xs text-muted">
            {reviewedLabel} {formatDate(guide.lastReviewedAt, locale)}
          </span>
        )}
      </span>
    </Link>
  );
}

/** Large spotlight for the lead guide on the homepage. */
export function GuidanceSpotlight({
  guide,
  locale,
  featuredLabel,
  readLabel,
}: {
  guide: GuidanceCardData;
  locale: Locale;
  featuredLabel: string;
  readLabel: string;
}) {
  const c = guide.accentColor;
  return (
    <Link
      href={guidanceHref(locale, guide)}
      className="group relative isolate flex h-full min-h-[360px] flex-col justify-end overflow-hidden rounded-2xl p-7 text-white shadow-[0_20px_50px_-24px_rgb(0_0_0/0.5)] transition duration-500 hover:-translate-y-1 sm:p-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 transition-transform duration-700 group-hover:scale-105"
        style={{
          background: guide.coverUrl
            ? `center / cover no-repeat url(${JSON.stringify(guide.coverUrl)})`
            : `radial-gradient(80% 60% at 90% 10%, ${tint(c, 60)} 0%, transparent 60%), linear-gradient(150deg, color-mix(in oklab, ${c} 75%, #031210) 0%, #06221f 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      />
      <span className="mb-auto inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-sm [:lang(km)_&]:tracking-normal [:lang(km)_&]:normal-case">
        <Icon name="star" className="size-3.5 fill-white/20" />
        {featuredLabel} · {guide.journeyTitle}
      </span>
      <h3 className="mt-16 max-w-xl text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight font-bold">{guide.title}</h3>
      {guide.summary && <p className="mt-3 line-clamp-3 max-w-xl leading-relaxed text-white/85">{guide.summary}</p>}
      <span className="mt-6 inline-flex items-center gap-2 font-bold">
        {readLabel}
        <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/** Compact numbered guide row for the "popular guidance" list. */
export function GuidanceRow({ guide, locale, n }: { guide: GuidanceCardData; locale: Locale; n: number }) {
  return (
    <Link
      href={guidanceHref(locale, guide)}
      className="group flex items-start gap-5 rounded-xl bg-white p-5 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-16px_rgb(0_0_0/0.25)]"
    >
      <span
        className="font-mono text-2xl leading-none font-bold tabular-nums opacity-80 transition-opacity group-hover:opacity-100"
        style={{ color: guide.accentColor }}
      >
        {String(n).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-xs font-bold tracking-wide uppercase" style={{ color: guide.accentColor }}>
          {guide.journeyTitle}
        </span>
        <span className="mt-1 block leading-snug text-black transition-colors group-hover:text-brand">
          {guide.title}
        </span>
      </span>
      <Icon
        name="arrowRight"
        className="mt-5 size-4 shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-brand"
      />
    </Link>
  );
}
