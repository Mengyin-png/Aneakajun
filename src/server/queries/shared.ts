import type { Locale } from "@/lib/i18n/config";
import { localizedName, pickTranslation } from "@/lib/i18n/localize";

export const PAGE_SIZE = 12;
export type SortOption = "newest" | "alpha" | "relevance";

export function parseSort(value: string | undefined, hasQuery: boolean): SortOption {
  if (value === "newest" || value === "alpha") return value;
  if (value === "relevance" && hasQuery) return "relevance";
  return hasQuery ? "relevance" : "newest";
}

export function parsePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? Math.min(n, 1000) : 1;
}

export type Paginated<T> = { items: T[]; total: number; page: number; pageCount: number };

export const published = { status: "PUBLISHED" } as const;

/** Case-insensitive substring match (served by pg_trgm GIN indexes; works for Khmer and English). */
export const contains = (q: string) => ({ contains: q, mode: "insensitive" as const });

/** Normalises a user-supplied search query. */
export function cleanQuery(q: string | undefined | null): string {
  return (q ?? "").replace(/\s+/g, " ").trim().slice(0, 100);
}

type Ranked = { id: string; date: Date | null; names: string[]; fields: (string | null | undefined)[] };

/** Relevance: exact name > name prefix > name contains > other field contains. */
export function relevance(item: Ranked, q: string): number {
  const query = q.toLocaleLowerCase();
  let best = 0;
  for (const n of item.names) {
    const name = n.toLocaleLowerCase();
    if (name === query) best = Math.max(best, 100);
    else if (name.startsWith(query)) best = Math.max(best, 80);
    else if (name.split(/\s+/).some((w) => w.startsWith(query))) best = Math.max(best, 70);
    else if (name.includes(query)) best = Math.max(best, 60);
  }
  if (best === 0 && item.fields.some((f) => f?.toLocaleLowerCase().includes(query))) best = 30;
  return best || 10; // matched via a related field (e.g. skill)
}

/** Sorts lightweight match rows, then returns the ids for one page. */
export function sortAndPage<T extends Ranked>(
  rows: T[],
  {
    sort,
    q,
    page,
    pageSize = PAGE_SIZE,
    locale,
  }: { sort: SortOption; q: string; page: number; pageSize?: number; locale: Locale },
) {
  const collator = new Intl.Collator(locale === "km" ? "km" : "en", { sensitivity: "base" });
  const sorted = [...rows].sort((a, b) => {
    if (sort === "alpha") return collator.compare(a.names[0] ?? "", b.names[0] ?? "");
    if (sort === "relevance" && q) {
      const diff = relevance(b, q) - relevance(a, q);
      if (diff) return diff;
    }
    return (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0);
  });
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  return {
    ids: sorted.slice((current - 1) * pageSize, current * pageSize).map((r) => r.id),
    total,
    page: current,
    pageCount,
  };
}

/** Restores DB results to the order of `ids`. */
export function inOrder<T extends { id: string }>(ids: string[], items: T[]): T[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  return ids.map((id) => byId.get(id)).filter((x): x is T => Boolean(x));
}

export type TaxonomyLabel = { slug: string; name: string };

export function label(
  item: { slug: string; name: string; nameKm: string | null } | null | undefined,
  locale: Locale,
): TaxonomyLabel | null {
  return item ? { slug: item.slug, name: localizedName(item, locale) } : null;
}

/** Display name in the current locale, sorted-by name in the same locale. */
export function translatedNames<T extends { locale: string; name: string }>(translations: T[], locale: Locale) {
  const t = pickTranslation(translations, locale);
  return t ? [t.name, ...translations.filter((x) => x !== t).map((x) => x.name)] : [];
}
