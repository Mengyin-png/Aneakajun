import { AdminPageHeader } from "@/components/admin/admin-table";
import { emptyTr, GuidanceForm } from "@/components/admin/guidance-form";
import { can, requireUser } from "@/lib/auth/guard";
import { journeyOptions } from "@/server/admin/journeys";

export const metadata = { title: "New guide" };

export default async function Page({ searchParams }: { searchParams: Promise<{ journey?: string }> }) {
  const user = await requireUser("content.create");
  const journeys = await journeyOptions();
  const pre = (await searchParams).journey;
  return (
    <>
      <AdminPageHeader title="New guide" />
      <GuidanceForm
        id={null}
        journeys={journeys}
        canPublish={can(user, "content.publish")}
        canDelete={false}
        initial={{
          journeyId: pre && journeys.some((j) => j.value === pre) ? pre : "",
          slug: "",
          status: "DRAFT",
          isFeatured: false,
          sortOrder: 0,
          cover: null,
          video: null,
          lastReviewedAt: "",
          reviewedBy: null,
          translations: { en: { ...emptyTr }, km: { ...emptyTr } },
          sections: [{ kind: "CONTENT", heading: "", headingKm: "", body: "", bodyKm: "", image: null }],
          references: [],
        }}
      />
    </>
  );
}
