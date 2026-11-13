import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-table";
import { FormBuilder } from "@/components/admin/form-builder";
import { requireUser } from "@/lib/auth/guard";
import { parseOptions, parseValidation } from "@/lib/forms/schema";
import { journeyOptions, loadJourneyForm } from "@/server/admin/journeys";

export const metadata = { title: "Edit form" };

const s = (n: number | undefined) => (n === undefined ? "" : String(n));

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser("forms.manage");
  const { id } = await params;
  const [form, journeys] = await Promise.all([loadJourneyForm(id), journeyOptions()]);
  if (!form) notFound();
  return (
    <>
      <AdminPageHeader title={form.title} />
      <Notice params={await searchParams} />
      <FormBuilder
        id={form.id}
        journeys={journeys}
        initial={{
          journeyId: form.journeyId ?? "",
          title: form.title,
          titleKm: form.titleKm ?? "",
          description: form.description ?? "",
          descriptionKm: form.descriptionKm ?? "",
          submitLabel: form.submitLabel ?? "",
          submitLabelKm: form.submitLabelKm ?? "",
          isActive: form.isActive,
          fields: form.fields.map((f) => {
            const v = parseValidation(f.validation);
            return {
              id: f.id,
              key: f.key,
              type: f.type,
              label: f.label,
              labelKm: f.labelKm ?? "",
              helpText: f.helpText ?? "",
              helpTextKm: f.helpTextKm ?? "",
              placeholder: f.placeholder ?? "",
              required: f.required,
              optionsText: parseOptions(f.options)
                .map((o) => [o.value, o.label, o.labelKm].filter(Boolean).join(" | "))
                .join("\n"),
              minLength: s(v.minLength),
              maxLength: s(v.maxLength),
              min: s(v.min),
              max: s(v.max),
            };
          }),
        }}
      />
    </>
  );
}
