"use client";

import { useState } from "react";
import { deleteArticle, saveArticle } from "@/server/actions/articles";
import { Card, FormAlert, LocaleTabs, MultiSelect, SelectInput, TextArea, TextInput, type Option } from "./controls";
import { MediaPicker, type PickedMedia } from "./media-picker";
import { PublishPanel, type WorkflowValues } from "./publish-panel";
import { useEntityForm } from "./use-entity-form";

type Tr = { title: string; excerpt: string; body: string; seoTitle: string; seoDescription: string };

export type ArticleFormValues = WorkflowValues & {
  featuredImage: PickedMedia;
  categoryId: string;
  authorPersonId: string;
  tagIds: string[];
  personIds: string[];
  organizationIds: string[];
  translations: { en: Tr; km: Tr };
};

export function ArticleForm({
  id,
  initial,
  options,
  canPublish,
  canDelete,
  meta,
}: {
  id: string | null;
  initial: ArticleFormValues;
  options: { categories: Option[]; tags: Option[]; people: Option[]; organizations: Option[] };
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
    (vals) => saveArticle(id, { ...vals, featuredImageId: vals.featuredImage?.id ?? null, featuredImage: undefined }),
    (newId) => `/admin/articles/${newId}`,
    !id,
  );
  const tr = v.translations[tab];
  const setTr = (p: Partial<Tr>) =>
    setValues((s) => ({ ...s, translations: { ...s.translations, [tab]: { ...s.translations[tab], ...p } } }));
  const e = (k: string) => errors[k];
  const trErr = (k: string) => errors[`translations.${tab}.${k}`];

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}

        <Card title="Content" description="Khmer is optional — fill in both title and body to publish a Khmer version.">
          <LocaleTabs active={tab} onChange={setTab} kmFilled={Boolean(v.translations.km.title)}>
            <div className="space-y-4" lang={tab}>
              <TextInput
                label="Title"
                required={tab === "en"}
                value={tr.title}
                onChange={(title) => setTr({ title })}
                error={trErr("title")}
                lang={tab}
              />
              <TextArea
                label="Excerpt"
                rows={2}
                value={tr.excerpt}
                onChange={(excerpt) => setTr({ excerpt })}
                error={trErr("excerpt")}
                lang={tab}
                hint="Short summary shown on cards and in search results."
              />
              <TextArea
                label="Body"
                required={tab === "en"}
                rows={16}
                value={tr.body}
                onChange={(body) => setTr({ body })}
                error={trErr("body")}
                lang={tab}
                hint="Markdown: ## Heading, - list item, > quote, **bold**, *italic*, [link](https://…). Blank line = new paragraph."
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
          <MediaPicker
            label="Featured image"
            value={v.featuredImage}
            onChange={(featuredImage) => patch({ featuredImage })}
            hint="16:9 images look best."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Category"
              value={v.categoryId}
              onChange={(categoryId) => patch({ categoryId })}
              options={options.categories}
              error={e("categoryId")}
            />
            <SelectInput
              label="Author (person profile)"
              value={v.authorPersonId}
              onChange={(authorPersonId) => patch({ authorPersonId })}
              options={options.people}
              error={e("authorPersonId")}
            />
          </div>
          <MultiSelect label="Tags" options={options.tags} value={v.tagIds} onChange={(tagIds) => patch({ tagIds })} />
        </Card>

        <Card title="Related" description="People and organizations featured in this article.">
          <div className="grid gap-4 sm:grid-cols-2">
            <MultiSelect
              label="People"
              options={options.people}
              value={v.personIds}
              onChange={(personIds) => patch({ personIds })}
            />
            <MultiSelect
              label="Organizations"
              options={options.organizations}
              value={v.organizationIds}
              onChange={(organizationIds) => patch({ organizationIds })}
            />
          </div>
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
        publicPath={meta?.slug ? `/articles/${meta.slug}` : null}
        previewPath={id ? `/admin/preview/article/${id}` : null}
        onDelete={id ? () => deleteArticle(id) : undefined}
        listPath="/admin/articles"
        meta={meta}
      />
    </form>
  );
}
