"use client";

import { useState } from "react";
import { deleteOrganization, saveOrganization } from "@/server/actions/organizations";
import { Card, Checkbox, FormAlert, LocaleTabs, SelectInput, TextArea, TextInput, type Option } from "./controls";
import { MediaPicker, type PickedMedia } from "./media-picker";
import { PublishPanel, type WorkflowValues } from "./publish-panel";
import { useEntityForm } from "./use-entity-form";

type Tr = {
  name: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  activities: string;
  address: string;
  seoTitle: string;
  seoDescription: string;
};
type Member = { personId: string; role: string; isKeyPerson: boolean; isCurrent: boolean };

export type OrganizationFormValues = WorkflowValues & {
  logo: PickedMedia;
  cover: PickedMedia;
  locationId: string;
  industryId: string;
  categoryId: string;
  foundedYear: string;
  websiteUrl: string;
  email: string;
  phone: string;
  facebookUrl: string;
  linkedinUrl: string;
  translations: { en: Tr; km: Tr };
  members: Member[];
};

export function OrganizationForm({
  id,
  initial,
  options,
  canPublish,
  canDelete,
  meta,
}: {
  id: string | null;
  initial: OrganizationFormValues;
  options: { locations: Option[]; industries: Option[]; categories: Option[]; people: Option[] };
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
    (vals) =>
      saveOrganization(id, {
        ...vals,
        logoId: vals.logo?.id ?? null,
        coverId: vals.cover?.id ?? null,
        logo: undefined,
        cover: undefined,
      }),
    (newId) => `/admin/organizations/${newId}`,
    !id,
  );
  const tr = v.translations[tab];
  const setTr = (p: Partial<Tr>) =>
    setValues((s) => ({ ...s, translations: { ...s.translations, [tab]: { ...s.translations[tab], ...p } } }));
  const e = (k: string) => errors[k];
  const trErr = (k: string) => errors[`translations.${tab}.${k}`];
  const setMember = (i: number, p: Partial<Member>) =>
    patch({ members: v.members.map((m, j) => (j === i ? { ...m, ...p } : m)) });

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}

        <Card title="Profile" description="Language-specific text. English is used whenever Khmer is missing.">
          <LocaleTabs active={tab} onChange={setTab} kmFilled={Boolean(v.translations.km.name)}>
            <div className="space-y-4" lang={tab}>
              <TextInput
                label="Organization name"
                required={tab === "en"}
                value={tr.name}
                onChange={(name) => setTr({ name })}
                error={trErr("name")}
                lang={tab}
                hint={tab === "km" ? "Leave empty to have no Khmer version." : undefined}
              />
              <TextInput
                label="Tagline"
                value={tr.tagline}
                onChange={(tagline) => setTr({ tagline })}
                error={trErr("tagline")}
                lang={tab}
              />
              <TextArea
                label="Description"
                rows={6}
                value={tr.description}
                onChange={(description) => setTr({ description })}
                error={trErr("description")}
                lang={tab}
                hint="Supports simple Markdown."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextArea
                  label="Mission"
                  rows={3}
                  value={tr.mission}
                  onChange={(mission) => setTr({ mission })}
                  error={trErr("mission")}
                  lang={tab}
                />
                <TextArea
                  label="Vision"
                  rows={3}
                  value={tr.vision}
                  onChange={(vision) => setTr({ vision })}
                  error={trErr("vision")}
                  lang={tab}
                />
              </div>
              <TextArea
                label="Activities"
                rows={4}
                value={tr.activities}
                onChange={(activities) => setTr({ activities })}
                error={trErr("activities")}
                lang={tab}
                hint="One activity per line."
              />
              <TextInput
                label="Address"
                value={tr.address}
                onChange={(address) => setTr({ address })}
                error={trErr("address")}
                lang={tab}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="SEO title"
                  value={tr.seoTitle}
                  onChange={(seoTitle) => setTr({ seoTitle })}
                  error={trErr("seoTitle")}
                />
                <TextInput
                  label="SEO description"
                  value={tr.seoDescription}
                  onChange={(seoDescription) => setTr({ seoDescription })}
                  error={trErr("seoDescription")}
                />
              </div>
            </div>
          </LocaleTabs>
        </Card>

        <Card title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaPicker label="Logo" value={v.logo} onChange={(logo) => patch({ logo })} />
            <MediaPicker
              label="Cover image"
              value={v.cover}
              onChange={(cover) => patch({ cover })}
              hint="Wide image, at least 1200px."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <TextInput
              label="Founded"
              type="number"
              value={v.foundedYear}
              onChange={(foundedYear) => patch({ foundedYear })}
              error={e("foundedYear")}
            />
          </div>
        </Card>

        <Card title="Contact">
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
              label="Email"
              type="email"
              value={v.email}
              onChange={(email) => patch({ email })}
              error={e("email")}
            />
            <TextInput label="Phone" value={v.phone} onChange={(phone) => patch({ phone })} error={e("phone")} />
            <TextInput
              label="Facebook"
              type="url"
              value={v.facebookUrl}
              onChange={(facebookUrl) => patch({ facebookUrl })}
              error={e("facebookUrl")}
              placeholder="https://"
            />
            <TextInput
              label="LinkedIn"
              type="url"
              value={v.linkedinUrl}
              onChange={(linkedinUrl) => patch({ linkedinUrl })}
              error={e("linkedinUrl")}
              placeholder="https://"
            />
          </div>
        </Card>

        <Card
          title="Key people & members"
          description="Only published people appear on the public page."
          actions={
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() =>
                patch({ members: [...v.members, { personId: "", role: "", isKeyPerson: false, isCurrent: true }] })
              }
            >
              + Add
            </button>
          }
        >
          {errors.members && <FormAlert kind="error">{errors.members}</FormAlert>}
          {v.members.length === 0 && <p className="text-sm text-muted">No members added.</p>}
          {v.members.map((m, i) => (
            <div
              key={i}
              className="grid items-end gap-3 rounded-lg border border-line p-3 sm:grid-cols-[1.4fr_1fr_auto_auto_auto]"
            >
              <SelectInput
                label="Person"
                required
                value={m.personId}
                onChange={(personId) => setMember(i, { personId })}
                options={options.people}
                error={e(`members.${i}.personId`)}
                emptyLabel="— Choose —"
              />
              <TextInput
                label="Role"
                value={m.role}
                onChange={(role) => setMember(i, { role })}
                error={e(`members.${i}.role`)}
              />
              <Checkbox
                label="Key person"
                checked={m.isKeyPerson}
                onChange={(isKeyPerson) => setMember(i, { isKeyPerson })}
              />
              <Checkbox label="Current" checked={m.isCurrent} onChange={(isCurrent) => setMember(i, { isCurrent })} />
              <button
                type="button"
                className="pb-2 text-xs font-medium text-danger hover:underline"
                onClick={() => patch({ members: v.members.filter((_, j) => j !== i) })}
              >
                Remove
              </button>
            </div>
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
        publicPath={meta?.slug ? `/organizations/${meta.slug}` : null}
        previewPath={id ? `/admin/preview/organization/${id}` : null}
        onDelete={id ? () => deleteOrganization(id) : undefined}
        listPath="/admin/organizations"
        meta={meta}
      />
    </form>
  );
}
