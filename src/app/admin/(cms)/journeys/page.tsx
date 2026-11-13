import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-table";
import { JourneyEditor } from "@/components/admin/journey-editor";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const metadata = { title: "Journeys" };

export default async function Page() {
  await requireUser("settings.manage");
  const journeys = await prisma.journey.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      cover: { select: { id: true, url: true } },
      video: { select: { id: true, url: true } },
      _count: { select: { articles: true, submissions: true } },
    },
  });
  return (
    <>
      <AdminPageHeader
        title="Journeys"
        description="The Live, Visit and Business paths: labels, colours, media and visibility."
      />
      <div className="max-w-4xl space-y-6">
        {journeys.map((j) => (
          <div key={j.id}>
            <p className="mb-2 text-sm text-muted">
              <Link href={`/admin/guidance?journey=${j.id}`} className="text-brand hover:underline">
                {j._count.articles} guides
              </Link>{" "}
              · {j._count.submissions} submissions ·{" "}
              <a href={`/${j.key}`} target="_blank" rel="noopener" className="hover:underline">
                View ↗
              </a>
            </p>
            <JourneyEditor
              initial={{
                id: j.id,
                key: j.key,
                title: j.title,
                titleKm: j.titleKm ?? "",
                verb: j.verb,
                verbKm: j.verbKm ?? "",
                description: j.description ?? "",
                descriptionKm: j.descriptionKm ?? "",
                icon: j.icon,
                accentColor: j.accentColor,
                cover: j.cover,
                video: j.video,
                isEnabled: j.isEnabled,
                sortOrder: j.sortOrder,
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
