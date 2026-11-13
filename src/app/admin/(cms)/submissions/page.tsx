import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-table";
import { SUBMISSION_STATUS_LABEL } from "@/components/admin/submission-review";
import { requireUser } from "@/lib/auth/guard";
import { adminListSubmissions, journeyOptions, SUBMISSION_STATUSES } from "@/server/admin/journeys";

export const metadata = { title: "Submissions" };

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/30",
  IN_REVIEW: "bg-brand/10 text-brand border-brand/30",
  APPROVED: "bg-success/10 text-success border-success/30",
  REJECTED: "bg-danger/10 text-danger border-danger/30",
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser("submissions.review");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = sp.status && (SUBMISSION_STATUSES as readonly string[]).includes(sp.status) ? sp.status : undefined;
  const journeyId = sp.journey?.slice(0, 40) || undefined;
  const [{ items, total, take, counts }, journeys] = await Promise.all([
    adminListSubmissions({ status, journeyId, page }),
    journeyOptions(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / take));
  const qs = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams(
      Object.entries({ status, journey: journeyId, ...p }).filter(([, v]) => v) as [string, string][],
    );
    const s = u.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <AdminPageHeader title="Submissions" description="Requests sent by members through journey forms." />
      <nav aria-label="Status" className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href={`/admin/submissions${qs({ status: undefined, page: undefined })}`}
          className={`rounded-full border px-3 py-1 ${!status ? "border-brand bg-brand text-white" : "border-line bg-white"}`}
        >
          All
        </Link>
        {SUBMISSION_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions${qs({ status: s, page: undefined })}`}
            className={`rounded-full border px-3 py-1 ${status === s ? "border-brand bg-brand text-white" : "border-line bg-white"}`}
          >
            {SUBMISSION_STATUS_LABEL[s]} <span className="opacity-70">({counts[s] ?? 0})</span>
          </Link>
        ))}
      </nav>
      <div className="card overflow-hidden">
        <form method="get" className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="sr-only" htmlFor="s-journey">
            Journey
          </label>
          <select id="s-journey" name="journey" defaultValue={journeyId ?? ""} className="input sm:max-w-44">
            <option value="">All journeys</option>
            {journeys.map((j) => (
              <option key={j.value} value={j.value}>
                {j.label}
              </option>
            ))}
          </select>
          <button className="btn-secondary">Filter</button>
          <p className="text-sm text-muted sm:ml-auto sm:self-center">{total} total</p>
        </form>
        {items.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No submissions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas text-left text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Member
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Form
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">
                    Submitted
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">
                    Reviewer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-canvas/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/submissions/${s.id}`} className="font-medium text-ink hover:text-brand">
                        {s.user.name}
                      </Link>
                      <p className="text-xs text-muted">{s.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {s.form.title}
                      {s.journey && <p className="text-xs text-muted">{s.journey.title}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[s.status]}`}
                      >
                        {SUBMISSION_STATUS_LABEL[s.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 whitespace-nowrap text-muted md:table-cell">
                      {s.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="hidden px-4 py-3 text-muted lg:table-cell">{s.reviewer?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pageCount > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-between border-t border-line p-3 text-sm">
            {page > 1 ? (
              <Link href={`/admin/submissions${qs({ page: String(page - 1) })}`} className="btn-secondary">
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-muted">
              Page {page} of {pageCount}
            </span>
            {page < pageCount ? (
              <Link href={`/admin/submissions${qs({ page: String(page + 1) })}`} className="btn-secondary">
                Next →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </>
  );
}
