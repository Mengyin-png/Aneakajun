import { OrganizationForm, type OrganizationFormValues } from "@/components/admin/organization-form";
import { emptyOrgTr } from "@/components/admin/form-defaults";
import { AdminPageHeader } from "@/components/admin/admin-table";
import { can, requireUser } from "@/lib/auth/guard";
import { categoryIdOptions, locationIdOptions, personOptions } from "@/server/admin/queries";

export const metadata = { title: "New organization" };

export default async function Page() {
  const user = await requireUser("content.create");
  const [locations, industries, categories, people] = await Promise.all([
    locationIdOptions(),
    categoryIdOptions("INDUSTRY"),
    categoryIdOptions("ORGANIZATION"),
    personOptions(),
  ]);
  const options = { locations, industries, categories, people };
  const initial: OrganizationFormValues = {
    slug: "",
    status: "DRAFT",
    isFeatured: false,
    sortOrder: 0,
    logo: null,
    cover: null,
    locationId: "",
    industryId: "",
    categoryId: "",
    foundedYear: "",
    websiteUrl: "",
    email: "",
    phone: "",
    facebookUrl: "",
    linkedinUrl: "",
    translations: { en: { ...emptyOrgTr }, km: { ...emptyOrgTr } },
    members: [],
  };

  return (
    <>
      <AdminPageHeader title="New organization" />
      <OrganizationForm
        id={null}
        initial={initial}
        options={options}
        canPublish={can(user, "content.publish")}
        canDelete={false}
      />
    </>
  );
}
