import Link from "next/link";
import { siFacebook, siTelegram, siYoutube, type SimpleIcon } from "simple-icons";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { getLocalizedSettings } from "@/server/queries/taxonomy";

type Settings = Awaited<ReturnType<typeof getLocalizedSettings>>;

function SocialIcon({ icon }: { icon: SimpleIcon | null }) {
  if (!icon) return <span className="text-[13px] font-bold">in</span>;
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]" fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

/** Dark ClassyAds footer: About · Navigation · Follow Us · search, then copyright. */
export function SiteFooter({ locale, t, settings }: { locale: Locale; t: Dictionary; settings: Settings }) {
  const social = [
    { name: "Facebook", href: settings.social.facebook, icon: siFacebook },
    { name: "Telegram", href: settings.social.telegram, icon: siTelegram },
    { name: "YouTube", href: settings.social.youtube, icon: siYoutube },
    { name: "LinkedIn", href: settings.social.linkedin, icon: null },
  ].filter((s): s is { name: string; href: string; icon: SimpleIcon | null } => Boolean(s.href));

  const nav: [string, string][] = [
    ["/about", t.nav.about],
    ["/people", t.nav.people],
    ["/organizations", t.nav.organizations],
    ["/articles", t.nav.articles],
    ["/opportunities", t.nav.opportunities],
  ];

  return (
    <footer className="bg-night text-white/80">
      <div className="container-page grid gap-12 py-20 sm:py-32 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="mb-6 text-white">{t.footer.about}</h2>
          <p className="max-w-[400px] leading-relaxed">{settings.description ?? settings.tagline}</p>
          {(settings.contactEmail || settings.address) && (
            <ul className="mt-5 space-y-1.5 text-sm">
              {settings.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-white hover:underline">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.contactPhone && <li>{settings.contactPhone}</li>}
              {settings.address && <li>{settings.address}</li>}
            </ul>
          )}
        </div>
        <div className="md:col-span-2">
          <h2 className="mb-6 text-white">{t.footer.navigation}</h2>
          <ul className="space-y-3">
            {nav.map(([href, label]) => (
              <li key={href}>
                <Link href={localePath(locale, href)} className="hover:text-white hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="mb-6 text-white">{t.footer.followUs}</h2>
          {social.length > 0 && (
            <ul className="flex flex-wrap gap-6 text-white">
              {social.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="block hover:text-brand"
                  >
                    <SocialIcon icon={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="md:col-span-3">
          <form method="get" action={localePath(locale, "/search")} role="search" className="flex">
            <label htmlFor="footer-q" className="sr-only">
              {t.footer.searchPlaceholder}
            </label>
            <input
              id="footer-q"
              name="q"
              type="search"
              placeholder={t.footer.searchPlaceholder}
              className="h-[43px] min-w-0 flex-1 border border-white/30 bg-transparent px-3 text-white placeholder:text-white/70 focus:border-white focus:outline-none"
            />
            <button className="h-[43px] bg-brand px-3 text-white hover:bg-brand-strong">{t.common.search}</button>
          </form>
        </div>
      </div>
      <div className="container-page">
        <div className="flex flex-col items-center gap-1 border-t border-white/10 py-12 text-center sm:pb-24">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. {t.footer.rights}
          </p>
          {settings.footerNote && <p className="text-sm text-white/60">{settings.footerNote}</p>}
        </div>
      </div>
    </footer>
  );
}
