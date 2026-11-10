import type { Metadata, Viewport } from "next";
import { Nanum_Gothic, Noto_Sans_Khmer } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { HTML_LANG, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { siteUrl } from "@/lib/seo";
import { getLocalizedSettings } from "@/server/queries/taxonomy";
import "@/app/globals.css";

const nanum = Nanum_Gothic({
  variable: "--font-nanum",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});
const khmer = Noto_Sans_Khmer({
  variable: "--font-khmer",
  subsets: ["khmer"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const s = await getLocalizedSettings(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.tagline ? `${s.siteName} — ${s.tagline}` : s.siteName, template: `%s · ${s.siteName}` },
    description: s.description ?? undefined,
    openGraph: { siteName: s.siteName },
  };
}

export const viewport: Viewport = { themeColor: "#ffffff" };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);
  const settings = await getLocalizedSettings(locale);

  return (
    <html lang={HTML_LANG[locale]} className={`${nanum.variable} ${khmer.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
        >
          {t.common.skipToContent}
        </a>
        <SiteHeader locale={locale} t={t} siteName={settings.siteName} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} t={t} settings={settings} />
      </body>
    </html>
  );
}
