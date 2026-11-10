/**
 * Locales. English lives at the root (/people), Khmer under /km (/km/people).
 * Internally both are served from app/[locale]/… — middleware rewrites
 * unprefixed URLs to /en/… so English URLs stay clean.
 */
export const LOCALES = ["en", "km"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "km";
}

/** Builds a public URL path for a locale: localePath("km", "/people") → "/km/people". */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export const LOCALE_LABELS: Record<Locale, string> = { en: "English", km: "ខ្មែរ" };
export const HTML_LANG: Record<Locale, string> = { en: "en", km: "km" };
