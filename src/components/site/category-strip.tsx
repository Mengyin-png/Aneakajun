import Link from "next/link";
import { categoryIcon, Icon } from "./icons";

export type CategoryItem = { slug: string; name: string; count: number; href: string };

/** White strip overlapping the hero: icon, label and count pill per category. */
export function CategoryStrip({ items, label }: { items: CategoryItem[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <div className="container-page relative z-10 -mt-6 sm:-mt-10">
      <nav aria-label={label} className="rounded-[7px] bg-white px-2 py-3 shadow-[var(--shadow-card)] sm:shadow-none">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((c) => (
            <li key={c.slug}>
              <Link
                href={c.href}
                className="group flex h-full flex-col items-center px-2.5 py-5 text-center sm:py-[30px]"
              >
                <Icon
                  name={categoryIcon(c.slug)}
                  className="size-12 text-brand transition group-hover:-translate-y-0.5"
                />
                <span className="mt-4 mb-2 block text-[15px] text-muted group-hover:text-brand">{c.name}</span>
                <span className="rounded-full bg-pill px-5 py-0.5 text-sm text-black tabular-nums">
                  {c.count.toLocaleString("en-US")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
