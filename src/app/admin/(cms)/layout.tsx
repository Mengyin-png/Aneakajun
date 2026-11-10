import Link from "next/link";
import { AdminNav, type AdminNavItem } from "@/components/admin/admin-nav";
import { can, requireUser } from "@/lib/auth/guard";
import type { PermissionKey } from "@/lib/auth/permissions";
import { logout } from "@/server/actions/auth";

export const dynamic = "force-dynamic";

const NAV: (AdminNavItem & { permission?: PermissionKey })[] = [
  { href: "/admin", label: "Dashboard", group: "Overview" },
  { href: "/admin/people", label: "People", group: "Content" },
  { href: "/admin/organizations", label: "Organizations", group: "Content" },
  { href: "/admin/articles", label: "Articles", group: "Content" },
  { href: "/admin/media", label: "Media library", group: "Content", permission: "media.upload" },
  { href: "/admin/taxonomy/categories", label: "Categories", group: "Taxonomy", permission: "taxonomy.manage" },
  { href: "/admin/taxonomy/tags", label: "Tags", group: "Taxonomy", permission: "taxonomy.manage" },
  { href: "/admin/taxonomy/skills", label: "Skills", group: "Taxonomy", permission: "taxonomy.manage" },
  { href: "/admin/taxonomy/locations", label: "Locations", group: "Taxonomy", permission: "taxonomy.manage" },
  { href: "/admin/users", label: "Users & roles", group: "System", permission: "users.manage" },
  { href: "/admin/settings", label: "Website settings", group: "System", permission: "settings.manage" },
  { href: "/admin/activity", label: "Activity log", group: "System", permission: "audit.view" },
];

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items = NAV.filter((i) => !i.permission || can(user, i.permission));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-lg bg-brand text-xs font-bold text-white"
            >
              A
            </span>
            Aneakajun <span className="font-normal text-muted">Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <a href="/" target="_blank" rel="noopener" className="hidden text-ink-soft hover:text-ink sm:inline">
              View site ↗
            </a>
            <span className="hidden text-right sm:block">
              <span className="block leading-tight font-medium">{user.name}</span>
              <span className="block text-xs leading-tight text-muted">{user.role.name}</span>
            </span>
            <form action={logout}>
              <button className="btn-secondary px-3 py-1.5 text-xs">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[210px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <details className="lg:hidden" open={false}>
            <summary className="btn-secondary w-full cursor-pointer">Menu</summary>
            <div className="mt-3">
              <AdminNav items={items} />
            </div>
          </details>
          <div className="hidden lg:block">
            <AdminNav items={items} />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
