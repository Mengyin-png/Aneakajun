import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonForm } from "@/components/admin/person-form";
import { AdminPageHeader, Notice } from "@/components/admin/admin-table";
import { can, canEditRecord, requireUser } from "@/lib/auth/guard";
import {
  loadPersonForm,
  categoryIdOptions,
  locationIdOptions,
  organizationOptions,
  skillOptions,
} from "@/server/admin/queries";

export const metadata = { title: "Edit person" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const data = await loadPersonForm(id);
  if (!data) notFound();

  if (!canEditRecord(user, data.record)) {
    return (
      <>
        <AdminPageHeader title={data.name} />
        <p className="card p-6 text-sm text-ink-soft">
          You can view but not edit this person.{" "}
          <Link href={`/admin/preview/person/${id}`} className="text-brand underline">
            Open preview
          </Link>
        </p>
      </>
    );
  }

  const [locations, industries, categories, skills, organizations] = await Promise.all([
    locationIdOptions(),
    categoryIdOptions("INDUSTRY"),
    categoryIdOptions("PEOPLE"),
    skillOptions(),
    organizationOptions(),
  ]);
  const options = { locations, industries, categories, skills, organizations };

  return (
    <>
      <AdminPageHeader title={data.name || "Edit person"} />
      <Notice params={await searchParams} />
      <PersonForm
        key={data.meta.updatedAt}
        id={id}
        initial={data.values}
        options={options}
        canPublish={can(user, "content.publish")}
        canDelete={can(user, "content.delete")}
        meta={data.meta}
      />
    </>
  );
}
