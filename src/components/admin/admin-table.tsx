import type { ContentStatus } from "@prisma/client";
import Link from "next/link";
import type { AdminRow } from "@/server/admin/queries";

const STATUS_STYLE: Record<ContentStatus, string> = {
  DRAFT: "bg-canvas text-ink-soft border-line",
  IN_REVIEW: "bg-warning/10 text-warning border-warning/30",
  PUBLISHED: "bg-success/10 text-success border-success/30",
  ARCHIVED: "bg-ink/5 text-muted border-line",
};
const STATUS_LABEL: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-primary self-start">
          + {action.label}
        </Link>
      )}
    </div>
  );
}

export function Notice({ params }: { params: Record<string, string | undefined> }) {
  const text = params.created
    ? "Created."
    : params.saved
      ? "Saved."
      : params.deleted
        ? "Deleted."
        : params.denied
          ? "You don't have permission to open that page."
          : null;
  if (!text) return null;
  return (
    <p
      role="status"
      className={`mb-4 rounded-lg px-4 py-3 text-sm ${params.denied ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}
    >
      {text}
    </p>
  );
}

/** Content list with search, status filter and pagination (server-rendered, GET form). */
export function AdminTable({
  basePath,
  rows,
  total,
  page,
  pageSize,
  q,
  status,
  publicBase,
}: {
  basePath: string;
  rows: AdminRow[];
  total: number;
  page: number;
  pageSize: number;
  q?: string;
  status?: string;
  publicBase: string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const link = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="card overflow-hidden">
      <form method="get" className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row">
        <label className="sr-only" htmlFor="admin-q">
          Search
        </label>
        <input
          id="admin-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by name or slug…"
          className="input sm:max-w-xs"
        />
        <label className="sr-only" htmlFor="admin-status">
          Status
        </label>
        <select id="admin-status" name="status" defaultValue={status ?? ""} className="input sm:max-w-44">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="IN_REVIEW">In review</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button className="btn-secondary">Filter</button>
        <p className="text-sm text-muted sm:ml-auto sm:self-center">{total} total</p>
      </form>
      {rows.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted">Nothing found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Name
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">
                  Created by
                </th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">
                  Updated
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-canvas/60">
                  <td className="px-4 py-3">
                    <Link href={`${basePath}/${r.id}`} className="font-medium text-ink hover:text-brand">
                      {r.title}
                    </Link>
                    {r.isFeatured && (
                      <span className="ml-2 text-xs text-gold" title="Featured">
                        ★ Featured
                      </span>
                    )}
                    {r.subtitle && <p className="max-w-md truncate text-xs text-muted">{r.subtitle}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">{r.createdBy ?? "—"}</td>
                  <td className="hidden px-4 py-3 whitespace-nowrap text-muted sm:table-cell">
                    {r.updatedAt.toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`${basePath}/${r.id}`} className="text-brand hover:underline">
                      Edit
                    </Link>
                    {r.status === "PUBLISHED" && (
                      <a
                        href={`${publicBase}/${r.slug}`}
                        target="_blank"
                        rel="noopener"
                        className="ml-3 text-ink-soft hover:underline"
                      >
                        View
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between border-t border-line p-3 text-sm">
          {page > 1 ? (
            <Link href={link(page - 1)} className="btn-secondary">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={link(page + 1)} className="btn-secondary">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
