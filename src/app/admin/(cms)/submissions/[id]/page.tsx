import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-table";
import { SUBMISSION_STATUS_LABEL, SubmissionReview } from "@/components/admin/submission-review";
import { requireUser } from "@/lib/auth/guard";
import { formatAnswer, parseOptions, type FieldType } from "@/lib/forms/schema";
import { loadSubmission } from "@/server/admin/journeys";

export const metadata = { title: "Submission" };

const when = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("submissions.review");
  const { id } = await params;
  const s = await loadSubmission(id);
  if (!s) notFound();
  const answers = [...s.answers].sort((a, b) => (a.field?.sortOrder ?? 999) - (b.field?.sortOrder ?? 999));

  return (
    <>
      <p className="mb-2 text-sm">
        <Link href="/admin/submissions" className="text-brand hover:underline">
          ← All submissions
        </Link>
      </p>
      <AdminPageHeader
        title={`${s.form.title} — ${s.user.name}`}
        description={`${SUBMISSION_STATUS_LABEL[s.status]} · submitted ${when(s.createdAt)}${s.journey ? ` · ${s.journey.title}` : ""} · ${s.locale.toUpperCase()}`}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">Member</h2>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
              <dt className="text-muted">Name</dt>
              <dd>{s.user.name}</dd>
              <dt className="text-muted">Email</dt>
              <dd>
                <a href={`mailto:${s.user.email}`} className="text-brand hover:underline">
                  {s.user.email}
                </a>
              </dd>
              <dt className="text-muted">Member since</dt>
              <dd>{s.user.createdAt.toLocaleDateString("en-GB")}</dd>
            </dl>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">Answers</h2>
            <dl className="divide-y divide-line text-sm">
              {answers.map((a) => (
                <div key={a.id} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr] sm:gap-6">
                  <dt className="text-muted">{a.fieldLabel}</dt>
                  <dd className="break-words whitespace-pre-wrap">
                    {formatAnswer(
                      { type: (a.field?.type ?? "TEXT") as FieldType, options: parseOptions(a.field?.options) },
                      a.value,
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">History</h2>
            <ol className="space-y-3 text-sm">
              {s.history.map((h) => (
                <li key={h.id} className="border-l-2 border-line pl-3">
                  <p>
                    {h.fromStatus ? `${SUBMISSION_STATUS_LABEL[h.fromStatus]} → ` : ""}
                    <strong>{SUBMISSION_STATUS_LABEL[h.toStatus]}</strong>
                    {h.note && <span className="text-ink-soft"> — {h.note}</span>}
                  </p>
                  <p className="text-xs text-muted">
                    {h.actor?.name ?? "Unknown"} · {when(h.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
            {s.reviewer && s.reviewedAt && (
              <p className="mt-4 text-xs text-muted">
                Last reviewed by {s.reviewer.name} on {when(s.reviewedAt)}
              </p>
            )}
          </section>
        </div>
        <div className="xl:sticky xl:top-20 xl:self-start">
          <SubmissionReview id={s.id} status={s.status} internalNotes={s.internalNotes ?? ""} />
        </div>
      </div>
    </>
  );
}
