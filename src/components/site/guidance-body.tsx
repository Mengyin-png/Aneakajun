import Link from "next/link";
import { buildPreview, type GuidancePreview } from "@/lib/guidance/preview";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/localize";
import { localePath, type Locale } from "@/lib/i18n/config";
import { Markdown } from "@/lib/markdown";
import type { GuidanceCardData, GuidanceDetail } from "@/server/queries/journeys";
import { Icon } from "./icons";
import { GuidanceCard } from "./journey-cards";

const KIND_STYLE: Record<string, string> = {
  NOTE: "border-l-4 border-brand bg-[#eaf5f3] p-5 rounded-r",
  WARNING: "border-l-4 border-[#b8730a] bg-[#fdf3e3] p-5 rounded-r",
};

/**
 * Renders a guidance article. When `fullAccess` is false only the server-computed
 * 40% preview is rendered — locked text never reaches the client.
 */
export function GuidanceBody({
  guide,
  related,
  locale,
  t,
  fullAccess,
  signInHref,
  formHref,
  previewBanner,
}: {
  guide: GuidanceDetail;
  related: GuidanceCardData[];
  locale: Locale;
  t: Dictionary;
  fullAccess: boolean;
  signInHref: string;
  formHref: string;
  previewBanner?: React.ReactNode;
}) {
  const input = guide.sections.map((s) => ({ ...s, imageUrl: s.imageUrl }));
  const preview: GuidancePreview = buildPreview(input, fullAccess);
  // Where a guest's preview stopped: after signing in, #continue lands here.
  const guestCut = fullAccess ? buildPreview(input, false) : preview;
  const lastGuest = guestCut.visible[guestCut.visible.length - 1];
  const continueAt =
    !fullAccess || !guestCut.locked
      ? null
      : lastGuest?.cutText
        ? lastGuest.id
        : (guide.sections[guestCut.visible.length]?.id ?? null);

  const toc = [
    ...preview.visible.map((s) => ({ id: s.id, heading: s.heading, locked: false })),
    ...preview.lockedHeadings.map((s) => ({ ...s, locked: true })),
  ];

  return (
    <div className="bg-canvas pb-20">
      <div className="container-page grid gap-10 pt-12 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          {previewBanner}
          {/* Mobile & tablet Table of Contents */}
          <details className="group mb-6 rounded-[7px] border border-line bg-white p-4 shadow-xs lg:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-black">
              <span>{t.guidance.contents}</span>
              <Icon name="chevronDown" className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <ol className="mt-3 space-y-2 border-t border-line pt-3 text-[15px]">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.locked ? "#continue" : `#s-${item.id}`}
                    className={`flex items-start gap-2 hover:text-brand ${item.locked ? "text-muted" : "text-ink-soft"}`}
                  >
                    {item.locked && <Icon name="lock" className="mt-1 size-3.5 shrink-0" />}
                    {item.heading}
                  </a>
                </li>
              ))}
              {guide.references.length > 0 && (
                <li>
                  <a href="#references" className="text-ink-soft hover:text-brand">
                    {t.guidance.references}
                  </a>
                </li>
              )}
            </ol>
          </details>
          <div className="overflow-hidden rounded-[7px] bg-white shadow-[var(--shadow-card)]">
            {guide.videoUrl ? (
              <video
                className="aspect-video w-full bg-black"
                src={guide.videoUrl}
                poster={guide.coverUrl ?? undefined}
                controls
                preload="metadata"
                playsInline
              />
            ) : guide.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={guide.coverUrl} alt="" className="aspect-[16/7] w-full object-cover" />
            ) : null}
            <div className="p-6 sm:p-10">
              {guide.summary && <p className="text-lg text-ink-soft">{guide.summary}</p>}
              <ReviewNotice guide={guide} locale={locale} t={t} />

              {preview.visible.map((s) => (
                <section key={s.id} id={`s-${s.id}`} className="mt-10 scroll-mt-28">
                  {continueAt === s.id && <span id="continue" className="block scroll-mt-28" />}
                  <div className={KIND_STYLE[s.kind] ?? ""}>
                    {s.kind !== "CONTENT" && (
                      <p className="mb-1 flex items-center gap-2 text-sm font-bold uppercase">
                        <Icon name={s.kind === "WARNING" ? "alert" : "doc"} className="size-4" />
                        {s.kind === "WARNING" ? t.guidance.warning : t.guidance.note}
                      </p>
                    )}
                    <h2 className="text-[1.45rem] font-normal text-black">{s.heading}</h2>
                    {s.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt={s.heading} className="mt-4 w-full rounded object-cover" />
                    )}
                    {s.body && <Markdown source={s.body} className="prose-content mt-3" />}
                    {s.cutText && (
                      <p
                        data-testid="preview-cut"
                        className="prose-content mt-3 [mask-image:linear-gradient(to_bottom,black,transparent)]"
                      >
                        {s.cutText}…
                      </p>
                    )}
                  </div>
                </section>
              ))}

              {preview.locked ? (
                <div
                  id="continue"
                  data-testid="guidance-lock"
                  className="mt-8 scroll-mt-28 rounded-[7px] border border-line bg-canvas p-7 text-center"
                >
                  <Icon name="lock" className="mx-auto size-9 text-brand" />
                  <p className="mt-3 text-xl font-bold text-black">{t.guidance.lockedTitle}</p>
                  <p className="mx-auto mt-2 max-w-md text-ink-soft">{t.guidance.lockedText}</p>
                  <a href={signInHref} className="btn-primary mt-5 h-[43px] px-6">
                    {t.guidance.signInGoogle}
                  </a>
                  {preview.lockedHeadings.length > 0 && (
                    <div className="mt-6 text-left">
                      <p className="text-sm font-bold text-muted">{t.guidance.lockedSections}</p>
                      <ul className="mt-2 space-y-1.5">
                        {preview.lockedHeadings.map((h) => (
                          <li key={h.id} className="flex items-center gap-2 text-ink-soft">
                            <Icon name="lock" className="size-4 shrink-0 text-muted" />
                            {h.heading}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {guide.nextSteps && (
                    <section id="next-steps" className="mt-12 rounded-[7px] bg-[#eaf5f3] p-6">
                      <h2 className="text-[1.45rem] font-normal text-brand">{t.guidance.nextSteps}</h2>
                      <Markdown source={guide.nextSteps} className="prose-content mt-3" />
                      <Link href={formHref} className="btn-primary mt-5 h-[43px] px-6">
                        {t.guidance.applyCta}
                      </Link>
                    </section>
                  )}
                  {!guide.nextSteps && (
                    <Link href={formHref} className="btn-primary mt-10 h-[43px] px-6">
                      {t.guidance.applyCta}
                    </Link>
                  )}
                </>
              )}

              {guide.references.length > 0 && (
                <section id="references" className="mt-12 border-t border-line pt-8">
                  <h2 className="text-[1.25rem] font-normal text-black">{t.guidance.references}</h2>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px]">
                    {guide.references.map((r) => (
                      <li key={r.id}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:underline"
                        >
                          {r.title}
                          <span className="sr-only"> (opens in new tab)</span>
                        </a>
                        {r.publisher && <span className="text-muted"> — {r.publisher}</span>}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              <p className="mt-8 rounded bg-canvas p-4 text-sm text-ink-soft" role="note">
                {t.guidance.disclaimer}
              </p>
            </div>
          </div>
        </article>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav aria-label={t.guidance.contents} className="rounded-[7px] bg-white p-6 shadow-[var(--shadow-card)]">
            <p className="text-sm font-bold text-black">{t.guidance.contents}</p>
            <ol className="mt-3 space-y-2 text-[15px]">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.locked ? "#continue" : `#s-${item.id}`}
                    className={`flex items-start gap-2 hover:text-brand ${item.locked ? "text-muted" : "text-ink-soft"}`}
                  >
                    {item.locked && <Icon name="lock" className="mt-1 size-3.5 shrink-0" />}
                    {item.heading}
                  </a>
                </li>
              ))}
              {guide.references.length > 0 && (
                <li>
                  <a href="#references" className="text-ink-soft hover:text-brand">
                    {t.guidance.references}
                  </a>
                </li>
              )}
            </ol>
          </nav>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-page mt-16">
          <h2 className="mb-6 text-[1.4rem] font-normal text-black">{t.guidance.related}</h2>
          <ul className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
            {related.map((g) => (
              <li key={g.id}>
                <GuidanceCard guide={g} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="sr-only">
        <Link href={localePath(locale, `/${guide.journeyKey}`)}>{guide.journeyTitle}</Link>
      </p>
    </div>
  );
}

function ReviewNotice({ guide, locale, t }: { guide: GuidanceDetail; locale: Locale; t: Dictionary }) {
  if (guide.lastReviewedAt) {
    return (
      <p className="mt-5 flex items-center gap-2 text-sm text-muted">
        <Icon name="check" className="size-4 text-brand" />
        {t.guidance.lastReviewed}:{" "}
        <time dateTime={guide.lastReviewedAt.toISOString()}>{formatDate(guide.lastReviewedAt, locale)}</time>
      </p>
    );
  }
  return (
    <p className="mt-5 flex items-start gap-2 rounded bg-[#fdf3e3] p-3 text-sm text-[#7a4b04]" role="note">
      <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
      {t.guidance.notReviewed}
    </p>
  );
}
