import Link from "next/link";
import { Suspense } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "./language-switcher";
import { MainNav } from "./main-nav";

/** Splits the site name into the ClassyAds two-tone wordmark (e.g. ANEAKA + JUN). */
export function Wordmark({ name, className = "" }: { name: string; className?: string }) {
  const upper = name.toUpperCase();
  const split = upper === "ANEAKAJUN" ? 6 : Math.ceil(upper.length / 2);
  return (
    <span className={`text-xl font-extrabold tracking-tight ${className}`}>
      <span className="text-black">{upper.slice(0, split)}</span>
      <span className="text-brand">{upper.slice(split)}</span>
    </span>
  );
}

/** Floating white header card over the page hero (ClassyAds layout). */
export function SiteHeader({ locale, t, siteName }: { locale: Locale; t: Dictionary; siteName: string }) {
  const items = [
    { href: localePath(locale, "/"), label: t.nav.home, exact: true },
    { href: localePath(locale, "/people"), label: t.nav.people },
    { href: localePath(locale, "/organizations"), label: t.nav.organizations },
    { href: localePath(locale, "/articles"), label: t.nav.articles },
    { href: localePath(locale, "/opportunities"), label: t.nav.opportunities },
    { href: localePath(locale, "/about"), label: t.nav.about },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-5">
      <div className="relative mx-auto flex h-16 max-w-[71.25rem] items-center justify-between gap-4 rounded bg-white px-5 shadow-sm sm:h-[85px] sm:px-[30px]">
        <Link href={localePath(locale, "/")} aria-label={siteName} className="shrink-0">
          <Wordmark name={siteName} />
        </Link>
        <MainNav
          items={items}
          labels={{ menu: t.common.menu, close: t.common.closeMenu }}
          languageSwitcher={
            <Suspense>
              <LanguageSwitcher locale={locale} label={t.common.language} />
            </Suspense>
          }
          cta={{ href: localePath(locale, "/search"), label: `+ ${t.nav.search}` }}
        />
      </div>
    </header>
  );
}
