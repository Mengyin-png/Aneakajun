import Link from "next/link";
import { AdminPageHeader, Notice, StatusBadge } from "@/components/admin/admin-table";
import { can, requireUser } from "@/lib/auth/guard";
import { adminListGuidance, journeyOptions } from "@/server/admin/journeys";
import { parseStatus } from "@/server/admin/queries";

export const metadata = { title: "Guidance" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const journeyId = sp.journey?.slice(0, 40) || undefined;
  // Contributors only see their own guides.
  const mine = can(user, "content.edit") ? undefined : user.id;
  const [rows, journeys] = await Promise.all([adminListGuidance({ journeyId, status, mine }), journeyOptions()]);

  return (
    <>
      <AdminPageHeader
        title="Guidance"
        description="Structured guides for the Live, Visit and Business journeys."
        action={can(user, "content.create") ? { href: "/admin/guidance/new", label: "New guide" } : undefined}
      />
      <Notice params={sp} />
      <div className="card overflow-hidden">
        <form method="get" className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row">
          <label className="sr-only" htmlFor="g-journey">
            Journey
          </label>
          <select id="g-journey" name="journey" defaultValue={journeyId ?? ""} className="input sm:max-w-44">
            <option value="">All journeys</option>
            {journeys.map((j) => (
              <option key={j.value} value={j.value}>
                {j.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="g-status">
            Status
          </label>
          <select id="g-status" name="status" defaultValue={status ?? ""} className="input sm:max-w-44">
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In review</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button className="btn-secondary">Filter</button>
          <p className="text-sm text-muted sm:ml-auto sm:self-center">{rows.length} total</p>
        </form>
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">Nothing found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas text-left text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Title
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Journey
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">
                    Reviewed
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">
                    Khmer
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => {
                  const en = r.translations.find((t) => t.locale === "en")?.title ?? r.slug;
                  const hasKm = r.translations.some((t) => t.locale === "km");
                  return (
                    <tr key={r.id} className="hover:bg-canvas/60">
                      <td className="px-4 py-3">
                        <Link href={`/admin/guidance/${r.id}`} className="font-medium text-ink hover:text-brand">
                          {en}
                        </Link>
                        {r.isFeatured && <span className="ml-2 text-xs text-gold">★ Featured</span>}
                        <p className="text-xs text-muted">
                          {r._count.sections} sections · {r._count.references} references
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{r.journey.title}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="hidden px-4 py-3 whitespace-nowrap md:table-cell">
                        {r.lastReviewedAt ? (
                          <span className="text-muted">{r.lastReviewedAt.toLocaleDateString("en-GB")}</span>
                        ) : (
                          <span className="text-warning">Not reviewed</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">{hasKm ? "✓" : "—"}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link href={`/admin/guidance/${r.id}`} className="text-brand hover:underline">
                          Edit
                        </Link>
                        <Link href={`/admin/preview/guidance/${r.id}`} className="ml-3 text-ink-soft hover:underline">
                          Preview
                        </Link>
                        {r.status === "PUBLISHED" && (
                          <a
                            href={`/${r.journey.key}/${r.slug}`}
                            target="_blank"
                            rel="noopener"
                            className="ml-3 text-ink-soft hover:underline"
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
