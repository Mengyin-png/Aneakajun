import Link from "next/link";
import { AdminPageHeader, Notice } from "@/components/admin/admin-table";
import { can, requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { dashboardStats } from "@/server/admin/queries";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const [stats, inReview, activity] = await Promise.all([
    dashboardStats(),
    can(user, "content.publish")
      ? Promise.all([
          prisma.person.findMany({
            where: { status: "IN_REVIEW" },
            select: { id: true, translations: { where: { locale: "en" }, select: { name: true } } },
            take: 5,
          }),
          prisma.organization.findMany({
            where: { status: "IN_REVIEW" },
            select: { id: true, translations: { where: { locale: "en" }, select: { name: true } } },
            take: 5,
          }),
          prisma.article.findMany({
            where: { status: "IN_REVIEW" },
            select: { id: true, translations: { where: { locale: "en" }, select: { title: true } } },
            take: 5,
          }),
        ])
      : null,
    can(user, "audit.view")
      ? prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          include: { user: { select: { name: true } } },
        })
      : null,
  ]);

  const cards = [
    { label: "People", href: "/admin/people", s: stats.people },
    { label: "Organizations", href: "/admin/organizations", s: stats.organizations },
    { label: "Articles", href: "/admin/articles", s: stats.articles },
  ];
  const review = inReview
    ? [
        ...inReview[0].map((x) => ({
          href: `/admin/people/${x.id}`,
          label: x.translations[0]?.name ?? "—",
          type: "Person",
        })),
        ...inReview[1].map((x) => ({
          href: `/admin/organizations/${x.id}`,
          label: x.translations[0]?.name ?? "—",
          type: "Organization",
        })),
        ...inReview[2].map((x) => ({
          href: `/admin/articles/${x.id}`,
          label: x.translations[0]?.title ?? "—",
          type: "Article",
        })),
      ]
    : [];

  return (
    <>
      <AdminPageHeader title={`Welcome, ${user.name}`} description={`Signed in as ${user.role.name}.`} />
      <Notice params={await searchParams} />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card p-5 transition hover:border-brand/40">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-ink">{c.s.total}</p>
            <p className="mt-2 text-xs text-muted">
              {c.s.byStatus.PUBLISHED} published · {c.s.byStatus.DRAFT} draft · {c.s.byStatus.IN_REVIEW} in review ·{" "}
              {c.s.byStatus.ARCHIVED} archived
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-muted">Media files</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.media}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Active admin users</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.users}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {inReview && (
          <section className="card p-5">
            <h2 className="font-semibold">Waiting for review</h2>
            {review.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Nothing is waiting for review.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {review.map((r) => (
                  <li key={r.href} className="flex items-center justify-between py-2 text-sm">
                    <Link href={r.href} className="font-medium text-brand hover:underline">
                      {r.label}
                    </Link>
                    <span className="text-xs text-muted">{r.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {activity && (
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent activity</h2>
              <Link href="/admin/activity" className="text-sm text-brand hover:underline">
                View all
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {activity.map((a) => (
                <li key={a.id} className="py-2 text-sm">
                  <p className="text-ink">{a.summary}</p>
                  <p className="text-xs text-muted">
                    {a.user?.name ?? "System"} · {a.createdAt.toLocaleString("en-GB")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
