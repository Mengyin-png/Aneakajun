import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** ClassyAds-style pagination: round page numbers, teal current page. Preserves filters. */
export function Pagination({
  basePath,
  params,
  page,
  pageCount,
  t,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageCount: number;
  t: Dictionary["common"];
}) {
  if (pageCount <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );
  const circle = "grid size-10 place-items-center rounded-full text-[15px] transition";

  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          rel="prev"
          aria-label={t.previous}
          className={`${circle} text-ink-soft hover:bg-pill`}
        >
          ←
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${circle} ${p === page ? "bg-brand text-white" : "bg-white text-ink-soft shadow-[var(--shadow-card)] hover:text-brand"}`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} rel="next" aria-label={t.next} className={`${circle} text-ink-soft hover:bg-pill`}>
          →
        </Link>
      )}
    </nav>
  );
}
