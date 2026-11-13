import Link from "next/link";
import { Icon } from "./icons";

/** Call-to-action band: deep teal panel with soft light, title, text and one action. */
export function CtaBand({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: { href: string; label: string } | null;
}) {
  return (
    <section className="bg-canvas py-16 sm:py-20">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-2xl bg-brand px-7 py-10 text-white shadow-[0_24px_60px_-28px_rgb(9_120_106/0.8)] sm:px-12 sm:py-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_100%_0%,rgb(255_255_255/0.22)_0%,transparent_60%),radial-gradient(50%_100%_at_0%_100%,#065c51_0%,transparent_70%)]"
          />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-[clamp(1.4rem,2.4vw,1.9rem)] leading-snug">{title}</h2>
              <p className="mt-2 leading-relaxed text-white/85">{text}</p>
            </div>
            {action && (
              action.href.startsWith("mailto:") || action.href.startsWith("http") ? (
                <a
                  href={action.href}
                  className="group inline-flex h-[50px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-7 font-bold text-brand-strong shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 md:self-auto"
                >
                  {action.label}
                  <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              ) : (
                <Link
                  href={action.href}
                  className="group inline-flex h-[50px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-7 font-bold text-brand-strong shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 md:self-auto"
                >
                  {action.label}
                  <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
