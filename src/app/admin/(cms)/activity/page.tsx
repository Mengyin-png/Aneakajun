import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-table";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const metadata = { title: "Activity log" };
const PAGE = 50;
const TYPES = [
  "Person",
  "Organization",
  "Article",
  "Media",
  "Category",
  "Tag",
  "Skill",
  "Location",
  "User",
  "SiteSettings",
];

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  await requireUser("audit.view");
  const sp = await searchParams;
  const type = TYPES.includes(sp.type ?? "") ? sp.type : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = type ? { entityType: type } : {};
  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const href = (p: number) =>
    `/admin/activity?${new URLSearchParams({ ...(type ? { type } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <>
      <AdminPageHeader title="Activity log" description="Every sign-in and content change made in the admin." />
      <form method="get" className="mb-4 flex gap-2">
        <label htmlFor="type" className="sr-only">
          Type
        </label>
        <select id="type" name="type" defaultValue={type ?? ""} className="input max-w-56">
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button className="btn-secondary">Filter</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">
                When
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Who
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Action
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2.5 whitespace-nowrap text-muted">{l.createdAt.toLocaleString("en-GB")}</td>
                <td className="px-4 py-2.5">{l.user?.name ?? <span className="text-muted">Deleted user</span>}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-xs">{l.action}</span>{" "}
                  <span className="text-muted">{l.entityType}</span>
                </td>
                <td className="px-4 py-2.5">{l.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="p-8 text-center text-sm text-muted">No activity yet.</p>}
      </div>
      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link className="btn-secondary" href={href(page - 1)}>
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link className="btn-secondary" href={href(page + 1)}>
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
