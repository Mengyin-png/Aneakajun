import type { Metadata } from "next";
import { localePath, type Locale } from "@/lib/i18n/config";

export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Page metadata with canonical URL, English/Khmer alternates (hreflang) and
 * Open Graph. `path` is the locale-less path, e.g. "/people/sokha-chan".
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  noindex = false,
}: {
  locale: Locale;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}): Metadata {
  const canonical = localePath(locale, path);
  return {
    title,
    description: description ?? undefined,
    alternates: {
      canonical,
      languages: { en: localePath("en", path), km: localePath("km", path), "x-default": localePath("en", path) },
    },
    openGraph: {
      title,
      description: description ?? undefined,
      url: canonical,
      type,
      locale: locale === "km" ? "km_KH" : "en_US",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description: description ?? undefined },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
