"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Fixed header shell. On the homepage it floats transparently over the hero
 * (white text) and turns into a solid white bar once the visitor scrolls;
 * elsewhere it is always the solid ClassyAds card.
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/km";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = isHome && !scrolled;
  return (
    <header
      data-overlay={overlay ? "true" : "false"}
      data-scrolled={scrolled ? "true" : "false"}
      className={`fixed inset-x-0 top-0 z-40 transition-[padding] duration-300 ease-(--ease-out-soft) ${
        scrolled ? "px-0 pt-0" : "px-3 pt-3 sm:px-4 sm:pt-5"
      }`}
    >
      <div
        className={`relative mx-auto flex items-center justify-between gap-4 transition-all duration-300 ease-(--ease-out-soft) ${
          overlay
            ? "h-16 max-w-[90rem] bg-transparent px-2 sm:h-[85px] sm:px-6"
            : scrolled
              ? "h-16 max-w-none border-b border-black/5 bg-white/95 px-5 shadow-[0_6px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-md sm:h-[72px] sm:px-[max(30px,calc((100vw-71.25rem)/2+30px))]"
              : "h-16 max-w-[71.25rem] rounded bg-white px-5 shadow-sm sm:h-[85px] sm:px-[30px]"
        }`}
      >
        {children}
      </div>
    </header>
  );
}
