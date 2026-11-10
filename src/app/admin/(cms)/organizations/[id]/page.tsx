import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizationForm } from "@/components/admin/organization-form";
import { AdminPageHeader, Notice } from "@/components/admin/admin-table";
import { can, canEditRecord, requireUser } from "@/lib/auth/guard";
import { loadOrganizationForm, categoryIdOptions, locationIdOptions, personOptions } from "@/server/admin/queries";

export const metadata = { title: "Edit organization" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const data = await loadOrganizationForm(id);
  if (!data) notFound();

  if (!canEditRecord(user, data.record)) {
    return (
      <>
        <AdminPageHeader title={data.name} />
        <p className="card p-6 text-sm text-ink-soft">
          You can view but not edit this organization.{" "}
          <Link href={`/admin/preview/organization/${id}`} className="text-brand underline">
            Open preview
          </Link>
        </p>
      </>
    );
  }

  const [locations, industries, categories, people] = await Promise.all([
    locationIdOptions(),
    categoryIdOptions("INDUSTRY"),
    categoryIdOptions("ORGANIZATION"),
    personOptions(),
  ]);
  const options = { locations, industries, categories, people };

  return (
    <>
      <AdminPageHeader title={data.name || "Edit organization"} />
      <Notice params={await searchParams} />
      <OrganizationForm
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
