import type { Locale } from "./config";

/**
 * Picks the translation for `locale`, falling back to English (always present).
 * Shared by every bilingual content type.
 */
export function pickTranslation<T extends { locale: string }>(translations: T[], locale: Locale): T | undefined {
  return translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "en");
}

/** For short labels stored as `name` + `nameKm`. */
export function localizedName(item: { name: string; nameKm?: string | null }, locale: Locale): string {
  return locale === "km" && item.nameKm ? item.nameKm : item.name;
}

/** Same pattern for arbitrary paired fields, e.g. settings.tagline / taglineKm. */
export function localizedField(en: string | null | undefined, km: string | null | undefined, locale: Locale) {
  return (locale === "km" && km ? km : en) ?? null;
}

export function formatDate(date: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "km" ? "km-KH" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
