import Link from "next/link";
import { siFacebook, siTelegram, siYoutube, type SimpleIcon } from "simple-icons";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { getLocalizedSettings } from "@/server/queries/taxonomy";
import { Icon } from "./icons";
import { Skyline } from "./skyline";

type Settings = Awaited<ReturnType<typeof getLocalizedSettings>>;

function SocialIcon({ icon }: { icon: SimpleIcon | null }) {
  if (!icon) return <span className="text-[13px] font-bold">in</span>;
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]" fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

const linkCls = "inline-flex items-center gap-2 transition-colors hover:text-white";

/** Dark footer: about + contact, directory, follow, search, then copyright. */
export function SiteFooter({ locale, t, settings }: { locale: Locale; t: Dictionary; settings: Settings }) {
  const social = [
    { name: "Facebook", href: settings.social.facebook, icon: siFacebook },
    { name: "Telegram", href: settings.social.telegram, icon: siTelegram },
    { name: "YouTube", href: settings.social.youtube, icon: siYoutube },
    { name: "LinkedIn", href: settings.social.linkedin, icon: null },
  ].filter((s): s is { name: string; href: string; icon: SimpleIcon | null } => Boolean(s.href));

  const nav: [string, string][] = [
    ["/people", t.nav.people],
    ["/organizations", t.nav.organizations],
    ["/articles", t.nav.articles],
    ["/opportunities", t.nav.opportunities],
    ["/about", t.nav.about],
  ];
  const upper = settings.siteName.toUpperCase();
  const split = upper === "ANEAKAJUN" ? 6 : Math.ceil(upper.length / 2);

  return (
    <footer className="relative isolate overflow-hidden bg-[#0b1715] text-white/70">
      <Skyline className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 w-full rotate-180 text-black opacity-25" />
      <div className="container-page grid gap-12 pt-20 pb-14 sm:pt-28 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href={localePath(locale, "/")} className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">{upper.slice(0, split)}</span>
            <span className="text-[#7fe0cf]">{upper.slice(split)}</span>
          </Link>
          <p className="mt-5 max-w-[360px] leading-relaxed">{settings.description ?? settings.tagline}</p>
          {(settings.contactEmail || settings.address || settings.contactPhone) && (
            <ul className="mt-6 space-y-2 text-sm">
              {settings.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className={linkCls}>
                    <Icon name="link" className="size-4 text-[#7fe0cf]" />
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.contactPhone && <li>{settings.contactPhone}</li>}
              {settings.address && (
                <li className="flex items-center gap-2">
                  <Icon name="location" className="size-4 text-[#7fe0cf]" />
                  {settings.address}
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="md:col-span-3">
          <h2 className="mb-5 text-sm font-bold tracking-[0.15em] text-white uppercase">{t.footer.navigation}</h2>
          <ul className="space-y-3">
            {nav.map(([href, label]) => (
              <li key={href}>
                <Link href={localePath(locale, href)} className={linkCls}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h2 className="mb-5 text-sm font-bold tracking-[0.15em] text-white uppercase">{t.footer.explore}</h2>
          <form
            method="get"
            action={localePath(locale, "/search")}
            role="search"
            className="flex overflow-hidden rounded-full border border-white/20 bg-white/5 focus-within:border-white/50"
          >
            <label htmlFor="footer-q" className="sr-only">
              {t.footer.searchPlaceholder}
            </label>
            <input
              id="footer-q"
              name="q"
              type="search"
              placeholder={t.footer.searchPlaceholder}
              className="h-[46px] min-w-0 flex-1 bg-transparent px-5 text-white placeholder:text-white/50 focus:outline-none"
            />
            <button className="m-1 inline-flex items-center gap-2 rounded-full bg-brand px-4 text-white transition hover:bg-brand-strong">
              <Icon name="search" className="size-4" />
              {t.common.search}
            </button>
          </form>
          {social.length > 0 && (
            <>
              <h2 className="mt-8 mb-4 text-sm font-bold tracking-[0.15em] text-white uppercase">
                {t.footer.followUs}
              </h2>
              <ul className="flex flex-wrap gap-3 text-white">
                {social.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="grid size-10 place-items-center rounded-full border border-white/15 transition hover:-translate-y-0.5 hover:border-transparent hover:bg-brand"
                    >
                      <SocialIcon icon={s.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      <div className="container-page">
        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 py-8 text-sm sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. {t.footer.rights}
          </p>
          {settings.footerNote && <p className="text-white/50">{settings.footerNote}</p>}
        </div>
      </div>
    </footer>
  );
}
