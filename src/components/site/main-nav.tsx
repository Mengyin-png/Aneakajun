"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

export type NavItem = { href: string; label: string; exact?: boolean };

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Desktop links, language switch, account and search; a sliding panel on small screens. */
export function MainNav({
  items,
  labels,
  languageSwitcher,
  userMenu,
  cta,
}: {
  items: NavItem[];
  labels: { menu: string; close: string };
  languageSwitcher: React.ReactNode;
  userMenu?: React.ReactNode;
  cta: { href: string; label: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Main" className="hidden flex-1 items-center justify-end gap-0.5 lg:flex">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <span key={item.href} className="flex items-center">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group/link relative flex items-center gap-1.5 px-2.5 py-2 text-[15px] transition-colors xl:px-3 ${
                  active
                    ? "text-brand on-hero:text-white"
                    : "text-black hover:text-brand on-hero:text-white/90 on-hero:hover:text-white"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-current transition-transform duration-300 ease-(--ease-out-soft) xl:inset-x-3 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover/link:scale-x-100"
                  }`}
                />
              </Link>
            </span>
          );
        })}
        <span aria-hidden="true" className="mx-2 h-5 w-px bg-line on-hero:bg-white/30" />
        {languageSwitcher}
        {userMenu}
        <Link
          href={cta.href}
          className="btn-primary ml-3 h-[39px] px-5 text-[15px] font-normal shadow-sm transition hover:-translate-y-px hover:shadow-md active:translate-y-0 on-hero:bg-white on-hero:text-hero-ink on-hero:hover:bg-white/90"
        >
          <Icon name="search" className="size-4" />
          {cta.label}
        </Link>
      </nav>

      <button
        type="button"
        className="grid size-10 place-items-center rounded-[var(--radius-control)] text-black transition hover:bg-black/5 on-hero:text-white on-hero:hover:bg-white/10 lg:hidden"
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
          <path
            strokeLinecap="round"
            className="origin-center transition-transform duration-300"
            d={open ? "M6 6l12 12" : "M4 7h16"}
          />
          {!open && <path strokeLinecap="round" d="M4 12h16" />}
          <path strokeLinecap="round" d={open ? "M18 6L6 18" : "M4 17h16"} />
        </svg>
      </button>

      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-xs transition-opacity duration-200 lg:hidden"
        />
      )}

      <div
        id="mobile-nav"
        ref={panelRef}
        data-overlay={open ? "true" : "false"}
        inert={!open}
        aria-hidden={!open}
        className={`absolute inset-x-0 top-full z-40 mt-2 origin-top rounded-[7px] bg-white p-4 shadow-[var(--shadow-card)] transition duration-200 ease-(--ease-out-soft) lg:hidden ${
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item) ? "page" : undefined}
              className={`flex items-center justify-between border-b border-line px-1 py-3 text-base last:border-0 ${isActive(pathname, item) ? "text-brand" : "text-black"}`}
            >
              {item.label}
              <Icon name="arrowRight" className="size-4 text-muted" />
            </Link>
          ))}
        </nav>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          {languageSwitcher}
          {userMenu}
          <Link href={cta.href} className="btn-primary px-5">
            <Icon name="search" className="size-4" />
            {cta.label}
          </Link>
        </div>
      </div>
    </>
  );
}
