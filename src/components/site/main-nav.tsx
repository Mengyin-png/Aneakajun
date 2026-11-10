"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type NavItem = { href: string; label: string; exact?: boolean };

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Desktop links, language switch and CTA; collapses into a dropdown on small screens. */
export function MainNav({
  items,
  labels,
  languageSwitcher,
  cta,
}: {
  items: NavItem[];
  labels: { menu: string; close: string };
  languageSwitcher: React.ReactNode;
  cta: { href: string; label: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <nav aria-label="Main" className="hidden flex-1 items-center justify-end gap-1 lg:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item) ? "page" : undefined}
            className={`px-2.5 py-2 text-[15px] transition xl:px-3 ${
              isActive(pathname, item) ? "text-brand" : "text-black hover:text-brand"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <span aria-hidden="true" className="mx-2 h-5 w-px bg-line" />
        {languageSwitcher}
        <Link href={cta.href} className="btn-primary ml-3 h-[39px] px-5 text-[15px] font-normal">
          {cta.label}
        </Link>
      </nav>

      <button
        type="button"
        className="grid size-10 place-items-center rounded-[var(--radius-control)] text-black lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? labels.close : labels.menu}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          {open ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full z-40 mt-2 rounded bg-white p-4 shadow-[var(--shadow-card)] lg:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item) ? "page" : undefined}
                className={`border-b border-line px-1 py-3 text-base last:border-0 ${isActive(pathname, item) ? "text-brand" : "text-black"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3">
            {languageSwitcher}
            <Link href={cta.href} className="btn-primary px-5">
              {cta.label}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
