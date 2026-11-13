"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export type FilterSelect = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel: string;
};

/**
 * Search + filter + sort controls. It is a plain GET form, so it works
 * without JavaScript; with JavaScript, changing a select applies immediately.
 */
export function FilterBar({
  q,
  qPlaceholder,
  selects,
  values,
  sort,
  sortOptions,
  labels,
}: {
  q?: string;
  qPlaceholder: string;
  selects: FilterSelect[];
  values: Record<string, string | undefined>;
  sort: string;
  sortOptions: { value: string; label: string }[];
  labels: { search: string; sort: string; apply: string; clear: string; filters: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const applyFromForm = (form: HTMLFormElement) => {
    const sp = new URLSearchParams();
    for (const [k, v] of new FormData(form).entries()) if (typeof v === "string" && v.trim()) sp.set(k, v.trim());
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== "page");

  return (
    <form
      method="get"
      role="search"
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        applyFromForm(e.currentTarget);
      }}
      className={`card-elevated relative z-10 -mt-8 sm:-mt-12 grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:flex lg:items-end transition-opacity ${pending ? "opacity-80" : ""}`}
    >
      <div className="sm:col-span-2 lg:min-w-0 lg:flex-[2]">
        <label htmlFor="filter-q" className="mb-1.5 block text-sm font-medium text-ink-soft">
          {labels.search}
        </label>
        <input
          id="filter-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={qPlaceholder}
          className="input h-[43px] text-[15px]"
        />
      </div>
      {selects.map((s) => (
        <div key={s.name} className="lg:min-w-0 lg:flex-1">
          <label htmlFor={`filter-${s.name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
            {s.label}
          </label>
          <select
            id={`filter-${s.name}`}
            name={s.name}
            defaultValue={values[s.name] ?? ""}
            className="input h-[43px] text-[15px]"
            onChange={(e) => applyFromForm(e.currentTarget.form!)}
          >
            <option value="">{s.allLabel}</option>
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="lg:min-w-0 lg:flex-1">
        <label htmlFor="filter-sort" className="mb-1.5 block text-sm font-medium text-ink-soft">
          {labels.sort}
        </label>
        <select
          id="filter-sort"
          name="sort"
          defaultValue={sort}
          className="input h-[43px] text-[15px]"
          onChange={(e) => applyFromForm(e.currentTarget.form!)}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 sm:col-span-2 lg:flex-none">
        <button
          type="submit"
          className="btn-primary inline-flex h-[43px] items-center justify-center gap-2 px-8 text-[15px] font-normal transition-opacity disabled:opacity-75"
          disabled={pending}
        >
          {pending && (
            <svg className="size-4 animate-spin text-current" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {labels.apply}
        </button>
        {hasFilters && (
          <button
            type="button"
            className="btn-secondary h-[43px] px-6 font-normal disabled:opacity-50"
            disabled={pending}
            onClick={() => startTransition(() => router.push(pathname))}
          >
            {labels.clear}
          </button>
        )}
      </div>
    </form>
  );
}
