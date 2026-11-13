import { AdminPageHeader } from "@/components/admin/admin-table";
import { emptyField, FormBuilder } from "@/components/admin/form-builder";
import { requireUser } from "@/lib/auth/guard";
import { journeyOptions } from "@/server/admin/journeys";

export const metadata = { title: "New form" };

export default async function Page() {
  await requireUser("forms.manage");
  return (
    <>
      <AdminPageHeader title="New form" />
      <FormBuilder
        id={null}
        journeys={await journeyOptions()}
        initial={{
          journeyId: "",
          title: "",
          titleKm: "",
          description: "",
          descriptionKm: "",
          submitLabel: "",
          submitLabelKm: "",
          isActive: true,
          fields: [emptyField(1)],
        }}
      />
    </>
  );
}
