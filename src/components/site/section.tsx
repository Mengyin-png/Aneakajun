import Link from "next/link";

/** Plain left heading (ClassyAds "Featured Ads"). */
export function PlainTitle({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="text-xl font-normal text-black sm:text-[1.35rem]">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="shrink-0 text-[15px] text-brand hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

/** Teal heading with a short underline bar (ClassyAds "Trending Today"). */
export function UnderlineTitle({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-12 flex items-end justify-between gap-4">
      <h2 className="relative pb-2 text-[1.9rem] font-normal text-brand after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-20 after:bg-brand">
        {title}
      </h2>
      {href && linkLabel && (
        <Link href={href} className="shrink-0 text-[15px] text-brand hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

/** Centred teal heading, subtitle and bar (ClassyAds "Popular Ads" / "Our Blog"). */
export function CenteredTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-12 text-center">
      <h2 className="text-[2rem] font-normal text-brand">{title}</h2>
      {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
      <span aria-hidden="true" className="mx-auto mt-5 block h-[3px] w-20 bg-brand" />
    </div>
  );
}

/** Kept for existing callers: plain section header with optional link. */
export const SectionHeader = PlainTitle;

export function EmptyState({ text }: { text: string }) {
  return <p className="card-elevated p-10 text-center text-ink-soft">{text}</p>;
}

export function Chip({ href, children }: { href?: string; children: React.ReactNode }) {
  const cls = "pill text-sm";
  return href ? (
    <Link href={href} className={`${cls} hover:bg-brand hover:text-white`}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}
