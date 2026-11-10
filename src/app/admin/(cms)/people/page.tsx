import { AdminPageHeader, AdminTable, Notice } from "@/components/admin/admin-table";
import { can, requireUser } from "@/lib/auth/guard";
import { ADMIN_PAGE_SIZE, adminListPeople, parseStatus } from "@/server/admin/queries";

export const metadata = { title: "People" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const status = parseStatus(sp.status);
  // Contributors only see their own content.
  const mine = can(user, "content.edit") ? undefined : user.id;
  const { items, total } = await adminListPeople({ q, status, page, mine });

  return (
    <>
      <AdminPageHeader
        title="People"
        description="Profiles of Cambodian people."
        action={can(user, "content.create") ? { href: "/admin/people/new", label: "New person" } : undefined}
      />
      <Notice params={sp} />
      <AdminTable
        basePath="/admin/people"
        rows={items}
        total={total}
        page={page}
        pageSize={ADMIN_PAGE_SIZE}
        q={q}
        status={status}
        publicBase="/people"
      />
    </>
  );
}
