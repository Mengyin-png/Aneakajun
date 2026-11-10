"use client";

import { useState } from "react";
import { deletePerson, savePerson } from "@/server/actions/people";
import { Card, FormAlert, LocaleTabs, MultiSelect, SelectInput, TextArea, TextInput, type Option } from "./controls";
import { MediaPicker, type PickedMedia } from "./media-picker";
import { PublishPanel, type WorkflowValues } from "./publish-panel";
import { useEntityForm } from "./use-entity-form";

type Tr = { name: string; headline: string; bio: string; seoTitle: string; seoDescription: string };
type Edu = { institution: string; degree: string; field: string; startYear: string; endYear: string };
type Exp = {
  title: string;
  organizationName: string;
  organizationId: string;
  startYear: string;
  endYear: string;
  description: string;
};

export type PersonFormValues = WorkflowValues & {
  photo: PickedMedia;
  locationId: string;
  industryId: string;
  categoryId: string;
  websiteUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
  xUrl: string;
  email: string;
  translations: { en: Tr; km: Tr };
  skillIds: string[];
  education: Edu[];
  experience: Exp[];
};

export function PersonForm({
  id,
  initial,
  options,
  canPublish,
  canDelete,
  meta,
}: {
  id: string | null;
  initial: PersonFormValues;
  options: {
    locations: Option[];
    industries: Option[];
    categories: Option[];
    skills: Option[];
    organizations: Option[];
  };
  canPublish: boolean;
  canDelete: boolean;
  meta?: { createdAt?: string; updatedAt?: string; createdBy?: string | null; slug?: string; status?: string };
}) {
  const [tab, setTab] = useState<"en" | "km">("en");
  const {
    values: v,
    patch,
    setValues,
    errors,
    message,
    saving,
    submit,
  } = useEntityForm(
    initial,
    (vals) => savePerson(id, { ...vals, photoId: vals.photo?.id ?? null, photo: undefined }),
    (newId) => `/admin/people/${newId}`,
    !id,
  );
  const tr = v.translations[tab];
  const setTr = (p: Partial<Tr>) =>
    setValues((s) => ({ ...s, translations: { ...s.translations, [tab]: { ...s.translations[tab], ...p } } }));
  const e = (k: string) => errors[k];
  const trErr = (k: string) => errors[`translations.${tab}.${k}`];

  const setEdu = (i: number, p: Partial<Edu>) =>
    patch({ education: v.education.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const setExp = (i: number, p: Partial<Exp>) =>
    patch({ experience: v.experience.map((x, j) => (j === i ? { ...x, ...p } : x)) });

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
        {errors.translations && <FormAlert kind="error">{errors.translations}</FormAlert>}

        <Card title="Profile" description="Language-specific text. English is used whenever Khmer is missing.">
          <LocaleTabs active={tab} onChange={setTab} kmFilled={Boolean(v.translations.km.name)}>
            <div className="space-y-4" lang={tab}>
              <TextInput
                label="Full name"
                required={tab === "en"}
                value={tr.name}
                onChange={(name) => setTr({ name })}
                error={trErr("name")}
                lang={tab}
                hint={tab === "km" ? "Leave empty to have no Khmer version." : undefined}
              />
              <TextInput
                label="Headline"
                value={tr.headline}
                onChange={(headline) => setTr({ headline })}
                error={trErr("headline")}
                lang={tab}
                hint="e.g. Founder & CEO, Mekong Solar"
              />
              <TextArea
                label="Biography"
                rows={8}
                value={tr.bio}
                onChange={(bio) => setTr({ bio })}
                error={trErr("bio")}
                lang={tab}
                hint="Supports ## headings, - lists, **bold**, *italic* and [links](https://…)."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="SEO title"
                  value={tr.seoTitle}
                  onChange={(seoTitle) => setTr({ seoTitle })}
                  error={trErr("seoTitle")}
                  hint="Defaults to the name."
                />
                <TextInput
                  label="SEO description"
                  value={tr.seoDescription}
                  onChange={(seoDescription) => setTr({ seoDescription })}
                  error={trErr("seoDescription")}
                  hint="Up to 160 characters."
                />
              </div>
            </div>
          </LocaleTabs>
        </Card>

        <Card title="Details">
          <MediaPicker
            label="Photo"
            value={v.photo}
            onChange={(photo) => patch({ photo })}
            hint="Square photos look best."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput
              label="Location"
              value={v.locationId}
              onChange={(locationId) => patch({ locationId })}
              options={options.locations}
              error={e("locationId")}
            />
            <SelectInput
              label="Industry"
              value={v.industryId}
              onChange={(industryId) => patch({ industryId })}
              options={options.industries}
              error={e("industryId")}
            />
            <SelectInput
              label="Category"
              value={v.categoryId}
              onChange={(categoryId) => patch({ categoryId })}
              options={options.categories}
              error={e("categoryId")}
            />
          </div>
          <MultiSelect
            label="Skills & expertise"
            options={options.skills}
            value={v.skillIds}
            onChange={(skillIds) => patch({ skillIds })}
            error={e("skillIds")}
          />
        </Card>

        <Card title="Links & contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Website"
              type="url"
              value={v.websiteUrl}
              onChange={(websiteUrl) => patch({ websiteUrl })}
              error={e("websiteUrl")}
              placeholder="https://"
            />
            <TextInput
              label="Public email"
              type="email"
              value={v.email}
              onChange={(email) => patch({ email })}
              error={e("email")}
            />
            <TextInput
              label="LinkedIn"
              type="url"
              value={v.linkedinUrl}
              onChange={(linkedinUrl) => patch({ linkedinUrl })}
              error={e("linkedinUrl")}
              placeholder="https://"
            />
            <TextInput
              label="Facebook"
              type="url"
              value={v.facebookUrl}
              onChange={(facebookUrl) => patch({ facebookUrl })}
              error={e("facebookUrl")}
              placeholder="https://"
            />
            <TextInput
              label="X (Twitter)"
              type="url"
              value={v.xUrl}
              onChange={(xUrl) => patch({ xUrl })}
              error={e("xUrl")}
              placeholder="https://"
            />
          </div>
        </Card>

        <Card
          title="Experience"
          description="Organization memberships (key people) are managed on the organization's page."
          actions={
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() =>
                patch({
                  experience: [
                    ...v.experience,
                    {
                      title: "",
                      organizationName: "",
                      organizationId: "",
                      startYear: "",
                      endYear: "",
                      description: "",
                    },
                  ],
                })
              }
            >
              + Add
            </button>
          }
        >
          {v.experience.length === 0 && <p className="text-sm text-muted">No experience added.</p>}
          {v.experience.map((x, i) => (
            <fieldset key={i} className="rounded-lg border border-line p-4">
              <legend className="px-1 text-xs font-medium text-muted">Position {i + 1}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label="Title"
                  required
                  value={x.title}
                  onChange={(title) => setExp(i, { title })}
                  error={e(`experience.${i}.title`)}
                />
                <TextInput
                  label="Organization name"
                  required
                  value={x.organizationName}
                  onChange={(organizationName) => setExp(i, { organizationName })}
                  error={e(`experience.${i}.organizationName`)}
                />
                <SelectInput
                  label="Link to listed organization"
                  value={x.organizationId}
                  onChange={(organizationId) => setExp(i, { organizationId })}
                  options={options.organizations}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Start year"
                    type="number"
                    value={x.startYear}
                    onChange={(startYear) => setExp(i, { startYear })}
                    error={e(`experience.${i}.startYear`)}
                  />
                  <TextInput
                    label="End year"
                    type="number"
                    value={x.endYear}
                    onChange={(endYear) => setExp(i, { endYear })}
                    error={e(`experience.${i}.endYear`)}
                    hint="Empty = current"
                  />
                </div>
              </div>
              <TextArea
                label="Description"
                rows={2}
                className="mt-3"
                value={x.description}
                onChange={(description) => setExp(i, { description })}
                error={e(`experience.${i}.description`)}
              />
              <button
                type="button"
                className="mt-3 text-xs font-medium text-danger hover:underline"
                onClick={() => patch({ experience: v.experience.filter((_, j) => j !== i) })}
              >
                Remove position
              </button>
            </fieldset>
          ))}
        </Card>

        <Card
          title="Education"
          actions={
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() =>
                patch({
                  education: [...v.education, { institution: "", degree: "", field: "", startYear: "", endYear: "" }],
                })
              }
            >
              + Add
            </button>
          }
        >
          {v.education.length === 0 && <p className="text-sm text-muted">No education added.</p>}
          {v.education.map((x, i) => (
            <fieldset key={i} className="rounded-lg border border-line p-4">
              <legend className="px-1 text-xs font-medium text-muted">Education {i + 1}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label="Institution"
                  required
                  value={x.institution}
                  onChange={(institution) => setEdu(i, { institution })}
                  error={e(`education.${i}.institution`)}
                />
                <TextInput
                  label="Degree"
                  value={x.degree}
                  onChange={(degree) => setEdu(i, { degree })}
                  error={e(`education.${i}.degree`)}
                />
                <TextInput
                  label="Field of study"
                  value={x.field}
                  onChange={(field) => setEdu(i, { field })}
                  error={e(`education.${i}.field`)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Start year"
                    type="number"
                    value={x.startYear}
                    onChange={(startYear) => setEdu(i, { startYear })}
                    error={e(`education.${i}.startYear`)}
                  />
                  <TextInput
                    label="End year"
                    type="number"
                    value={x.endYear}
                    onChange={(endYear) => setEdu(i, { endYear })}
                    error={e(`education.${i}.endYear`)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-danger hover:underline"
                onClick={() => patch({ education: v.education.filter((_, j) => j !== i) })}
              >
                Remove
              </button>
            </fieldset>
          ))}
        </Card>
      </div>

      <PublishPanel
        values={v}
        onChange={(p) => patch(p)}
        errors={errors}
        canPublish={canPublish}
        canDelete={canDelete}
        saving={saving}
        isPublished={meta?.status === "PUBLISHED"}
        publicPath={meta?.slug ? `/people/${meta.slug}` : null}
        previewPath={id ? `/admin/preview/person/${id}` : null}
        onDelete={id ? () => deletePerson(id) : undefined}
        listPath="/admin/people"
        meta={meta}
      />
    </form>
  );
}
