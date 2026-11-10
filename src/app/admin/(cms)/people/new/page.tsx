import { PersonForm, type PersonFormValues } from "@/components/admin/person-form";
import { emptyPersonTr } from "@/components/admin/form-defaults";
import { AdminPageHeader } from "@/components/admin/admin-table";
import { can, requireUser } from "@/lib/auth/guard";
import { categoryIdOptions, locationIdOptions, organizationOptions, skillOptions } from "@/server/admin/queries";

export const metadata = { title: "New person" };

export default async function Page() {
  const user = await requireUser("content.create");
  const [locations, industries, categories, skills, organizations] = await Promise.all([
    locationIdOptions(),
    categoryIdOptions("INDUSTRY"),
    categoryIdOptions("PEOPLE"),
    skillOptions(),
    organizationOptions(),
  ]);
  const options = { locations, industries, categories, skills, organizations };
  const initial: PersonFormValues = {
    slug: "",
    status: "DRAFT",
    isFeatured: false,
    sortOrder: 0,
    photo: null,
    locationId: "",
    industryId: "",
    categoryId: "",
    websiteUrl: "",
    linkedinUrl: "",
    facebookUrl: "",
    xUrl: "",
    email: "",
    translations: { en: { ...emptyPersonTr }, km: { ...emptyPersonTr } },
    skillIds: [],
    education: [],
    experience: [],
  };

  return (
    <>
      <AdminPageHeader title="New person" />
      <PersonForm
        id={null}
        initial={initial}
        options={options}
        canPublish={can(user, "content.publish")}
        canDelete={false}
      />
    </>
  );
}
