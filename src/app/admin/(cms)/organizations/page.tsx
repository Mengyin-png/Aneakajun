import { AdminPageHeader, AdminTable, Notice } from "@/components/admin/admin-table";
import { can, requireUser } from "@/lib/auth/guard";
import { ADMIN_PAGE_SIZE, adminListOrganizations, parseStatus } from "@/server/admin/queries";

export const metadata = { title: "Organizations" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const status = parseStatus(sp.status);
  // Contributors only see their own content.
  const mine = can(user, "content.edit") ? undefined : user.id;
  const { items, total } = await adminListOrganizations({ q, status, page, mine });

  return (
    <>
      <AdminPageHeader
        title="Organizations"
        description="Companies, NGOs, associations and institutions."
        action={
          can(user, "content.create") ? { href: "/admin/organizations/new", label: "New organization" } : undefined
        }
      />
      <Notice params={sp} />
      <AdminTable
        basePath="/admin/organizations"
        rows={items}
        total={total}
        page={page}
        pageSize={ADMIN_PAGE_SIZE}
        q={q}
        status={status}
        publicBase="/organizations"
      />
    </>
  );
}
