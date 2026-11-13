"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icons";
import { Skyline } from "./skyline";

export type HeroJourney = {
  key: string;
  verb: string;
  title: string;
  description: string | null;
  icon: string;
  accentColor: string;
  coverUrl: string | null;
  href: string;
};

/** Lighter tint of a journey colour that stays legible on the dark hero. */
const tint = (c: string, amount = 55) => `color-mix(in oklab, ${c} ${amount}%, white)`;

/**
 * Cinematic home hero: optional looping muted video (wider screens, motion
 * allowed), poster/fallback image with a slow push-in, layered light and a
 * temple horizon. Only the headline "I want to [Live ▾] in Cambodia." and one
 * "Learn more" button: the selector is the single journey chooser on the page.
 */
export function JourneyHero({
  prefix,
  suffix,
  subtitle,
  ctaLabel,
  chooseLabel,
  scrollLabel,
  videoUrl,
  imageUrl,
  journeys,
}: {
  prefix: string;
  suffix: string;
  subtitle?: string | null;
  ctaLabel: string;
  chooseLabel: string;
  scrollLabel?: string;
  videoUrl: string | null;
  imageUrl: string | null;
  journeys: HeroJourney[];
}) {
  const listId = useId();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Show the focus ring only for keyboard use, not after a mouse/touch pick.
  const [kbd, setKbd] = useState(false);
  const current = journeys[index];

  useEffect(() => {
    const onKey = () => setKbd(true);
    const onPointer = () => setKbd(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  // Video only on wider screens and when the visitor has not asked for reduced motion.
  useEffect(() => {
    if (!videoUrl) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const update = () => setPlayVideo(!motion.matches && wide.matches);
    update();
    motion.addEventListener("change", update);
    wide.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      wide.removeEventListener("change", update);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    listRef.current?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  if (!current) return null;

  const choose = (i: number, refocus = true) => {
    setIndex(i);
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setActive((a) => (a + 1) % journeys.length);
    else if (e.key === "ArrowUp") setActive((a) => (a - 1 + journeys.length) % journeys.length);
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(journeys.length - 1);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") buttonRef.current?.focus();
      return;
    } else return;
    e.preventDefault();
  };

  const poster = imageUrl ?? current.coverUrl;
  const accent = current.accentColor;

  return (
    <section
      aria-label={`${prefix} ${current.verb} ${suffix}`}
      className="relative isolate flex min-h-[max(680px,100svh)] flex-col overflow-hidden bg-hero-ink text-white"
    >
      {/* ── Background layers ── */}
      {journeys.map((j, i) => (
        <div
          key={j.key}
          aria-hidden="true"
          className="absolute inset-0 -z-30 transition-opacity duration-1000 ease-(--ease-out-soft)"
          style={{
            opacity: i === index ? 1 : 0,
            background: `radial-gradient(120% 80% at 75% 85%, ${j.accentColor} 0%, transparent 60%), radial-gradient(90% 70% at 10% 10%, color-mix(in oklab, ${j.accentColor} 45%, #06221f) 0%, transparent 70%), linear-gradient(160deg, #06221f 0%, #0a2f2a 45%, #041513 100%)`,
          }}
        />
      ))}
      {/* Drifting light, like late-afternoon sun through haze. */}
      <div
        aria-hidden="true"
        className="absolute -top-1/4 left-1/2 -z-20 size-[70vmax] -translate-x-1/2 animate-drift rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(circle, ${tint(accent, 35)} 0%, transparent 60%)` }}
      />
      {(poster || (videoUrl && playVideo)) && (
        <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
          {poster && (
            <div
              className={`absolute inset-0 animate-kenburns bg-cover bg-center transition-opacity duration-700 ${videoReady ? "opacity-0" : "opacity-100"}`}
              style={{ backgroundImage: `url(${JSON.stringify(poster)})` }}
            />
          )}
          {videoUrl && playVideo && (
            <video
              className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${videoReady ? "opacity-100" : "opacity-0"}`}
              src={videoUrl}
              poster={poster ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onPlaying={() => setVideoReady(true)}
            />
          )}
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.15)_28%,rgb(0_0_0/0.1)_60%,rgb(4_21_19/0.85)_100%)]"
      />
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[34vh] max-h-[300px] min-h-[150px] w-full text-[#031210] opacity-90" />

      {/* ── Content ── */}
      <div className="container-page flex flex-1 flex-col items-center justify-center pt-28 pb-28 text-center sm:pt-32 sm:pb-36">
        <h1 className="relative z-20 mx-auto max-w-[17ch] animate-rise text-[clamp(2.5rem,7vw,5.6rem)] leading-[1.08] font-normal tracking-[-0.02em] [animation-delay:80ms] sm:max-w-[20ch] lg:max-w-none [:lang(km)_&]:leading-[1.38] [:lang(km)_&]:tracking-normal">
          <span>{prefix} </span>
          <span ref={wrapRef} className="relative inline-block align-baseline">
            <button
              ref={buttonRef}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listId}
              aria-label={`${chooseLabel}: ${current.verb}`}
              data-testid="journey-select"
              onClick={() => {
                setActive(index);
                setOpen((v) => !v);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive(index);
                  setOpen(true);
                }
              }}
              // Same typeface, weight, colour and baseline as the sentence for every
              // option; only the underline and the chevron carry the journey colour.
              className="hero-select group/sel inline cursor-pointer rounded-md font-bold whitespace-nowrap text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#06221f]"
            >
              <span
                className="underline decoration-[0.06em] underline-offset-[0.16em] transition-[text-decoration-color] duration-500 [text-decoration-skip-ink:none]"
                style={{ textDecorationColor: tint(accent, 60) }}
              >
                {current.verb}
              </span>
              <span
                aria-hidden="true"
                className="ml-[0.2em] inline-grid size-[0.56em] translate-y-[-0.08em] place-items-center rounded-full align-middle text-white shadow-lg transition-[background-color,transform] duration-300 group-hover/sel:scale-110"
                style={{ background: accent }}
              >
                <Icon
                  name="chevronDown"
                  className={`size-[0.38em] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-label={chooseLabel}
              aria-activedescendant={open ? `${listId}-${journeys[active]?.key}` : undefined}
              aria-hidden={!open}
              inert={!open}
              onKeyDown={onListKey}
              className={`absolute top-full left-1/2 z-30 mt-4 w-[min(22rem,88vw)] origin-top -translate-x-1/2 rounded-2xl bg-white p-2 text-left text-base font-normal tracking-normal text-black shadow-[0_24px_60px_-12px_rgb(0_0_0/0.45)] ring-1 ring-black/5 outline-none transition duration-200 ease-(--ease-out-soft) ${
                open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0"
              }`}
            >
              {journeys.map((j, i) => (
                <li
                  key={j.key}
                  id={`${listId}-${j.key}`}
                  role="option"
                  aria-selected={i === index}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={`relative flex cursor-pointer items-start gap-3.5 rounded-xl px-3 py-3 transition-colors ${
                    i === active ? "bg-black/[0.045]" : ""
                  }`}
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-sm transition-transform duration-200 ${i === active ? "scale-105" : ""}`}
                    style={{ background: `linear-gradient(140deg, ${tint(j.accentColor, 80)}, ${j.accentColor})` }}
                  >
                    <Icon name={j.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-[17px] leading-snug font-bold">
                      {j.verb}
                      {i === index && <Icon name="check" className="size-4 shrink-0" />}
                    </span>
                    {j.description && (
                      <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-ink-soft">
                        {j.description}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </span>
          <span> {suffix}</span>
        </h1>

        {subtitle && (
          <p className="relative z-20 mx-auto mt-4 max-w-2xl animate-rise text-base leading-relaxed text-white/85 [animation-delay:140ms] sm:text-lg">
            {subtitle}
          </p>
        )}

        <div className="mt-10 flex animate-rise justify-center [animation-delay:200ms] sm:mt-12">
          <Link
            href={current.href}
            data-testid="journey-cta"
            aria-label={`${ctaLabel}: ${current.title}`}
            className="group/cta inline-flex min-h-[54px] items-center gap-3 rounded-full py-2 pr-2 pl-7 text-left text-[17px] text-white shadow-[0_14px_40px_-12px_rgb(0_0_0/0.6)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgb(0_0_0/0.7)] active:translate-y-0 active:scale-[0.98]"
            style={{ background: `linear-gradient(120deg, ${accent}, ${tint(accent, 75)})` }}
          >
            <span key={current.key} className="animate-rise font-bold [animation-duration:0.4s]">
              {ctaLabel}
            </span>
            <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover/cta:translate-x-0.5">
              <Icon name="arrowRight" className="size-5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Scroll indicator cue */}
      <a
        href="#main-content"
        aria-label={scrollLabel ?? "Scroll to content"}
        className="group absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 text-xs tracking-wider uppercase text-white/70 transition-colors hover:text-white"
      >
        <span className="sr-only sm:not-sr-only text-[11px] font-semibold">{scrollLabel ?? "Scroll"}</span>
        <span className="relative flex h-8 w-5 items-start justify-center rounded-full border border-white/30 p-1">
          <span className="block h-2 w-1 rounded-full bg-white animate-scroll-cue" />
        </span>
      </a>
    </section>
  );
}
