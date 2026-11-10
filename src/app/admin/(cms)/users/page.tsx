import { AdminPageHeader } from "@/components/admin/admin-table";
import { UsersManager } from "@/components/admin/users-manager";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const metadata = { title: "Users & roles" };

export default async function UsersPage() {
  const me = await requireUser("users.manage");
  const [users, roles] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }], include: { role: true } }),
    prisma.role.findMany({ orderBy: { rank: "desc" } }),
  ]);
  return (
    <>
      <AdminPageHeader title="Users & roles" description="Only people with an account can sign in to the admin." />
      <UsersManager
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          roleId: u.roleId,
          roleName: u.role.name,
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
          isSelf: u.id === me.id,
        }))}
        roles={roles.map((r) => ({ value: r.id, label: r.name, description: r.description ?? "" }))}
      />
    </>
  );
}
