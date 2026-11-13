"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

/** Horizontally scrolling row with ClassyAds-style ← → controls (scroll-snap, keyboard friendly). */
export function Carousel({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => checkScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return (
    <div className="-mx-2.5 overflow-hidden [contain:paint]">
      {/* The wrapper clips the off-screen cards so the page itself never scrolls sideways. */}
      <ul
        ref={ref}
        aria-label={label}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pt-1 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <div className="mt-4 flex items-center justify-center gap-8">
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={!canScrollLeft}
          className="grid size-10 place-items-center rounded-full text-[#555] transition hover:bg-black/5 hover:text-brand disabled:pointer-events-none disabled:opacity-25"
          aria-label="Previous"
        >
          <Icon name="arrowLeft" className="size-6" />
        </button>
        <span aria-hidden="true" className="h-1.5 w-12 overflow-hidden rounded-full bg-line">
          <span
            className="block h-full rounded-full bg-brand transition-all duration-300"
            style={{
              width: canScrollLeft && canScrollRight ? "50%" : "35%",
              marginLeft: !canScrollLeft ? "0%" : !canScrollRight ? "65%" : "25%",
            }}
          />
        </span>
        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={!canScrollRight}
          className="grid size-10 place-items-center rounded-full text-[#555] transition hover:bg-black/5 hover:text-brand disabled:pointer-events-none disabled:opacity-25"
          aria-label="Next"
        >
          <Icon name="arrowRight" className="size-6" />
        </button>
      </div>
    </div>
  );
}

export function CarouselItem({ children }: { children: React.ReactNode }) {
  return <li className="w-[85%] shrink-0 snap-start px-2.5 sm:w-1/2 lg:w-1/4">{children}</li>;
}
