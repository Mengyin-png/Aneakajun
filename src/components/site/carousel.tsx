"use client";

import { useRef } from "react";
import { Icon } from "./icons";

/** Horizontally scrolling row with ClassyAds-style ← → controls (scroll-snap, keyboard friendly). */
export function Carousel({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
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
      <div className="mt-4 flex justify-center gap-10">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="text-[#555] transition hover:text-brand"
          aria-label="Previous"
        >
          <Icon name="arrowLeft" className="size-7" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="text-[#555] transition hover:text-brand"
          aria-label="Next"
        >
          <Icon name="arrowRight" className="size-7" />
        </button>
      </div>
    </div>
  );
}

export function CarouselItem({ children }: { children: React.ReactNode }) {
  return <li className="w-[85%] shrink-0 snap-start px-2.5 sm:w-1/2 lg:w-1/4">{children}</li>;
}
