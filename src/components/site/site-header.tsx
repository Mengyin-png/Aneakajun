import Link from "next/link";
import { Suspense } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { HeaderFrame } from "./header-frame";
import { LanguageSwitcher } from "./language-switcher";
import { MainNav } from "./main-nav";
import { UserMenu } from "./user-menu";

/** Splits the site name into the ClassyAds two-tone wordmark (e.g. ANEAKA + JUN). */
export function Wordmark({ name, className = "" }: { name: string; className?: string }) {
  const upper = name.toUpperCase();
  const split = upper === "ANEAKAJUN" ? 6 : Math.ceil(upper.length / 2);
  return (
    <span className={`text-xl font-extrabold tracking-tight ${className}`}>
      <span className="text-black transition-colors on-hero:text-white">{upper.slice(0, split)}</span>
      <span className="text-brand transition-colors on-hero:text-[#7fe0cf]">{upper.slice(split)}</span>
    </span>
  );
}

/** Fixed header: transparent over the home hero, the ClassyAds white card elsewhere. */
export function SiteHeader({ locale, t, siteName }: { locale: Locale; t: Dictionary; siteName: string }) {
  const items = [
    { href: localePath(locale, "/people"), label: t.nav.people },
    { href: localePath(locale, "/organizations"), label: t.nav.organizations },
    { href: localePath(locale, "/articles"), label: t.nav.articles },
    { href: localePath(locale, "/about"), label: t.nav.about },
  ];

  return (
    <HeaderFrame>
      <Link
        href={localePath(locale, "/")}
        aria-label={siteName}
        className="shrink-0 transition-opacity hover:opacity-80"
      >
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
        userMenu={<UserMenu labels={{ signIn: t.auth.signIn, signOut: t.auth.signOut, admin: t.auth.admin }} />}
        cta={{ href: localePath(locale, "/search"), label: t.nav.search }}
      />
    </HeaderFrame>
  );
}
