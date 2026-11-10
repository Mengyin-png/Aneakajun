"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";

type Suggestion = { type: "person" | "organization" | "article"; slug: string; label: string };
const BASE: Record<Suggestion["type"], string> = {
  person: "/people",
  organization: "/organizations",
  article: "/articles",
};

/**
 * Keyword field with as-you-type suggestions (accessible combobox). It is a
 * plain input named "q" inside the surrounding search form: Enter submits the
 * form unless a suggestion is highlighted, which opens that profile instead.
 */
export function SuggestInput({
  id,
  locale,
  placeholder,
  typeLabels,
  defaultValue = "",
  className = "",
}: {
  id: string;
  locale: Locale;
  placeholder: string;
  typeLabels: Record<Suggestion["type"], string>;
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}&locale=${locale}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          setItems(((await res.json()) as { suggestions: Suggestion[] }).suggestions);
          setActive(-1);
        }
      } catch {
        /* aborted or offline — suggestions are optional */
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, locale]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (s: Suggestion) => {
    setOpen(false);
    router.push(localePath(locale, `${BASE[s.type]}/${s.slug}`));
  };
  const showList = open && items.length > 0;

  return (
    <div ref={boxRef} className="relative">
      <input
        id={id}
        name="q"
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (a + 1) % items.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
          } else if (e.key === "Escape") {
            setOpen(false);
          } else if (e.key === "Enter" && active >= 0 && items[active]) {
            e.preventDefault();
            go(items[active]);
          }
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        className={`input ${className}`}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-[6px] bg-white py-1 text-left shadow-[var(--shadow-card)]"
        >
          {items.map((s, i) => (
            <li
              key={`${s.type}-${s.slug}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                go(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[15px] ${i === active ? "bg-brand-soft text-brand" : "text-ink-soft"}`}
            >
              <span className="truncate">{s.label}</span>
              <span className="shrink-0 text-xs text-muted">{typeLabels[s.type]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
