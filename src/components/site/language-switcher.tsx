"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALES, LOCALE_LABELS, localePath, type Locale } from "@/lib/i18n/config";

/** Links to the same page in the other language (English at /…, Khmer at /km/…). */
export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const bare = pathname === "/km" ? "/" : pathname.startsWith("/km/") ? pathname.slice(3) : pathname;

  return (
    <nav aria-label={label} className="flex items-center gap-1 text-[15px]">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden="true" className="text-[#ccc]">
              /
            </span>
          )}
          <Link
            href={`${localePath(l, bare)}${search ? `?${search}` : ""}`}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            className={`px-1 py-2 ${l === locale ? "text-brand" : "text-black hover:text-brand"}`}
          >
            {l === "en" ? "EN" : LOCALE_LABELS[l]}
          </Link>
        </span>
      ))}
    </nav>
  );
}
