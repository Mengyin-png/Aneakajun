import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DynamicForm } from "@/components/site/dynamic-form";
import { PageHero } from "@/components/site/hero";
import { Icon } from "@/components/site/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate, localizedField } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo";
import { getActiveForm, getJourney, getMySubmissions } from "@/server/queries/journeys";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string; journey: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const journey = await getJourney((await params).journey, locale);
  if (!journey) return {};
  const t = getDictionary(locale);
  return {
    ...pageMetadata({ locale, path: `/${journey.key}/form`, title: `${t.form.title} — ${journey.title}` }),
    robots: { index: false },
  };
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-pill text-black",
  IN_REVIEW: "bg-[#e6ecfa] text-[#2f4b9c]",
  APPROVED: "bg-[#eaf5f3] text-brand",
  REJECTED: "bg-red-50 text-red-700",
};

export default async function JourneyFormPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const journey = await getJourney((await params).journey, locale);
  if (!journey) notFound();
  const t = getDictionary(locale);
  const [form, user] = await Promise.all([getActiveForm(journey.id, locale), getCurrentUser()]);
  const mine = user ? await getMySubmissions(user.id, journey.id) : [];
  const path = localePath(locale, `/${journey.key}/form`);

  return (
    <>
      <PageHero
        title={form?.title ?? t.form.title}
        subtitle={form?.description}
        crumbs={[
          { href: localePath(locale, "/"), label: t.nav.home },
          { href: localePath(locale, `/${journey.key}`), label: journey.title },
          { label: t.form.title },
        ]}
      />
      <section className="section bg-canvas">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[7px] bg-white p-6 shadow-[var(--shadow-card)] sm:p-10">
            {!form ? (
              <p className="text-ink-soft">{t.form.noForm}</p>
            ) : !user ? (
              <div className="py-2 text-center" data-testid="form-signin">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand-light/30 text-brand">
                  <Icon name="lock" className="size-6" />
                </div>
                <h2 className="text-xl font-bold text-brand">{form.title}</h2>
                {form.description && (
                  <p className="mx-auto mt-2 max-w-lg text-sm text-ink-soft">{form.description}</p>
                )}
                <div className="mx-auto mt-6 max-w-md rounded-[var(--radius-card)] border border-line bg-canvas p-5">
                  <p className="text-sm font-medium text-ink-soft">{t.form.signInToSubmit}</p>
                  <a
                    href={`/auth/google/start?next=${encodeURIComponent(path)}`}
                    className="btn-primary mt-4 inline-flex h-[43px] items-center justify-center px-6"
                  >
                    {t.guidance.signInGoogle}
                  </a>
                </div>
              </div>
            ) : (
              <DynamicForm
                form={form}
                locale={locale}
                labels={{
                  submit: t.form.submit,
                  sending: t.form.sending,
                  success: t.form.success,
                  required: t.form.required,
                }}
              />
            )}
            <p className="mt-8 text-sm text-muted">{t.form.privacy}</p>
            <p className="mt-2 text-sm text-muted">{t.guidance.disclaimer}</p>
          </div>

          {user && (
            <aside className="lg:self-start">
              <div className="rounded-[7px] bg-white p-6 shadow-[var(--shadow-card)]" data-testid="my-submissions">
                <h2 className="text-lg text-black">{t.form.yourRequests}</h2>
                {mine.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">—</p>
                ) : (
                  <ul className="mt-3 divide-y divide-line">
                    {mine.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span>
                          <span className="block text-black">
                            {localizedField(s.form.title, s.form.titleKm, locale)}
                          </span>
                          <span className="text-muted">
                            {t.form.submitted} {formatDate(s.createdAt, locale)}
                          </span>
                        </span>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${STATUS_STYLE[s.status]}`}>
                          {t.form.status[s.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
