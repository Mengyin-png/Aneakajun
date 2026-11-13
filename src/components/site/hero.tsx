import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";

/**
 * Optional hero photograph: put a licensed image at /public/images/hero.jpg.
 * Without it, a deep-teal gradient in the same palette is used.
 */
const HERO_IMAGE = "/images/hero.jpg";
const hasHeroImage = () => existsSync(path.join(process.cwd(), "public", HERO_IMAGE));

/** Full-bleed cover with dark overlay, behind the floating header. */
export function Cover({ id, className, children }: { id?: string; className: string; children: React.ReactNode }) {
  const photo = hasHeroImage();
  return (
    <section
      id={id}
      className={`relative isolate overflow-hidden bg-[#0b3d36] ${className}`}
      style={
        photo
          ? { backgroundImage: `url(${HERO_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {!photo && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(ellipse_at_85%_75%,rgba(9,120,106,0.9),transparent_55%),linear-gradient(135deg,#0b3d36_0%,#09786a_55%,#0e4f47_100%)]"
        />
      )}
      {!photo && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/40" />
      {children}
    </section>
  );
}

/** Home hero: big centred heading, subtitle and search bar. */
export function HomeHero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Cover className="flex min-h-[640px] items-center pt-28 pb-40 sm:min-h-[min(900px,100svh)] sm:pt-32">
      <div className="container-page text-center">
        <h1 className="mx-auto max-w-[730px] text-[2.1rem] leading-tight font-normal text-white sm:text-5xl sm:leading-[1.2]">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[730px] text-[1.05rem] text-white/90 sm:text-[1.2rem]">{subtitle}</p>
        <div className="mt-10">{children}</div>
      </div>
    </Cover>
  );
}

export type Crumb = { href?: string; label: string };

/** Inner-page banner with title and breadcrumb, same cover style. */
export function PageHero({ title, subtitle, crumbs }: { title: string; subtitle?: string | null; crumbs?: Crumb[] }) {
  return (
    <Cover id="main-content" className="pt-36 pb-16 sm:pt-44 sm:pb-20">
      <div className="container-page text-center">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/80">
            <ol className="flex flex-wrap items-center justify-center gap-2">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {c.href ? (
                    <Link href={c.href} className="hover:text-white hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="mx-auto max-w-3xl text-3xl leading-tight font-normal text-white sm:text-[2.6rem]">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-2xl text-white/90 sm:text-lg">{subtitle}</p>}
      </div>
    </Cover>
  );
}
