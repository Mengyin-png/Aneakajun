import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";

/** Resolves the [locale] route param or 404s. */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function str(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() ? v.trim().slice(0, 100) : undefined;
}
