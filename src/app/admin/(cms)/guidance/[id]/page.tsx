import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-table";
import { GuidanceForm } from "@/components/admin/guidance-form";
import { can, canEditRecord, requireUser } from "@/lib/auth/guard";
import { journeyOptions, loadGuidanceForm } from "@/server/admin/journeys";

export const metadata = { title: "Edit guide" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [data, journeys] = await Promise.all([loadGuidanceForm(id), journeyOptions()]);
  if (!data) notFound();
  const { createdById, ...initial } = data;
  const editable = canEditRecord(user, { createdById, status: initial.status });
  return (
    <>
      <AdminPageHeader title={initial.translations.en.title || "Edit guide"} />
      <Notice params={await searchParams} />
      {!editable && (
        <p className="mb-4 rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
          You can view but not edit this guide.
        </p>
      )}
      <GuidanceForm
        id={id}
        initial={initial}
        journeys={journeys}
        canPublish={can(user, "content.publish")}
        canDelete={can(user, "content.delete")}
      />
    </>
  );
}
