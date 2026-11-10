import { AdminPageHeader, AdminTable, Notice } from "@/components/admin/admin-table";
import { can, requireUser } from "@/lib/auth/guard";
import { ADMIN_PAGE_SIZE, adminListArticles, parseStatus } from "@/server/admin/queries";

export const metadata = { title: "Articles" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const status = parseStatus(sp.status);
  // Contributors only see their own content.
  const mine = can(user, "content.edit") ? undefined : user.id;
  const { items, total } = await adminListArticles({ q, status, page, mine });

  return (
    <>
      <AdminPageHeader
        title="Articles"
        description="Blog posts, interviews and guides."
        action={can(user, "content.create") ? { href: "/admin/articles/new", label: "New article" } : undefined}
      />
      <Notice params={sp} />
      <AdminTable
        basePath="/admin/articles"
        rows={items}
        total={total}
        page={page}
        pageSize={ADMIN_PAGE_SIZE}
        q={q}
        status={status}
        publicBase="/articles"
      />
    </>
  );
}
