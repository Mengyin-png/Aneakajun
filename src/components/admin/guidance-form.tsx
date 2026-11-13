"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteGuidance, saveGuidance } from "@/server/actions/journeys-admin";
import { Card, Checkbox, FormAlert, LocaleTabs, SelectInput, TextArea, TextInput, type Option } from "./controls";
import { errAt, moveItem, RowControls } from "./list-editor";
import { MediaPicker, type PickedMedia } from "./media-picker";

type Tr = { title: string; summary: string; nextSteps: string; seoTitle: string; seoDescription: string };
export type GuidanceSectionValue = {
  kind: "CONTENT" | "NOTE" | "WARNING";
  heading: string;
  headingKm: string;
  body: string;
  bodyKm: string;
  image: PickedMedia;
};
export type GuidanceReferenceValue = { title: string; titleKm: string; url: string; publisher: string };
export type GuidanceFormValues = {
  journeyId: string;
  slug: string;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  sortOrder: number | string;
  cover: PickedMedia;
  video: PickedMedia;
  lastReviewedAt: string;
  reviewedBy: string | null;
  translations: { en: Tr; km: Tr };
  sections: GuidanceSectionValue[];
  references: GuidanceReferenceValue[];
};

export const emptyTr: Tr = { title: "", summary: "", nextSteps: "", seoTitle: "", seoDescription: "" };

export function GuidanceForm({
  id,
  initial,
  journeys,
  canPublish,
  canDelete,
}: {
  id: string | null;
  initial: GuidanceFormValues;
  journeys: Option[];
  canPublish: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [loc, setLoc] = useState<"en" | "km">("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof GuidanceFormValues>(k: K, val: GuidanceFormValues[K]) =>
    setV((s) => ({ ...s, [k]: val }));
  const tr = v.translations[loc];
  const setTr = (k: keyof Tr, val: string) =>
    setV((s) => ({ ...s, translations: { ...s.translations, [loc]: { ...s.translations[loc], [k]: val } } }));
  const setSection = (i: number, patch: Partial<GuidanceSectionValue>) =>
    set(
      "sections",
      v.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    );
  const setRef = (i: number, patch: Partial<GuidanceReferenceValue>) =>
    set(
      "references",
      v.references.map((r, j) => (j === i ? { ...r, ...patch } : r)),
    );

  const statusOptions: Option[] = [
    { value: "DRAFT", label: "Draft" },
    { value: "IN_REVIEW", label: "In review" },
    ...(canPublish
      ? [
          { value: "PUBLISHED", label: "Published" },
          { value: "ARCHIVED", label: "Archived" },
        ]
      : []),
  ];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveGuidance(id, {
        journeyId: v.journeyId,
        slug: v.slug,
        status: v.status,
        isFeatured: v.isFeatured,
        sortOrder: v.sortOrder,
        coverId: v.cover?.id ?? null,
        videoId: v.video?.id ?? null,
        lastReviewedAt: v.lastReviewedAt,
        translations: v.translations,
        sections: v.sections.map(({ image, ...s }) => ({ ...s, imageId: image?.id ?? null })),
        references: v.references,
      });
      setErrors(res.ok ? {} : (res.errors ?? {}));
      setMessage({ kind: res.ok ? "success" : "error", text: res.ok ? (res.message ?? "Saved.") : res.message });
      if (res.ok) {
        if (!id) router.push(`/admin/guidance/${res.data.id}?created=1`);
        else router.refresh();
      }
    });
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
        <Card title="Article" description="Title, summary and next steps in English and Khmer.">
          <LocaleTabs active={loc} onChange={setLoc} kmFilled={!!v.translations.km.title}>
            <div className="space-y-4">
              <TextInput
                label={loc === "en" ? "Title" : "Title (Khmer)"}
                required={loc === "en"}
                lang={loc}
                value={tr.title}
                onChange={(x) => setTr("title", x)}
                error={errAt(errors, `translations.${loc}.title`)}
              />
              <TextArea
                label="Summary / introduction"
                lang={loc}
                rows={3}
                value={tr.summary}
                onChange={(x) => setTr("summary", x)}
              />
              <TextArea
                label="Next steps (Markdown)"
                lang={loc}
                rows={4}
                value={tr.nextSteps}
                onChange={(x) => setTr("nextSteps", x)}
                hint="Shown at the end with a link to the journey form."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="SEO title"
                  lang={loc}
                  value={tr.seoTitle}
                  onChange={(x) => setTr("seoTitle", x)}
                  error={errAt(errors, `translations.${loc}.seoTitle`)}
                />
                <TextInput
                  label="SEO description"
                  lang={loc}
                  value={tr.seoDescription}
                  onChange={(x) => setTr("seoDescription", x)}
                  error={errAt(errors, `translations.${loc}.seoDescription`)}
                />
              </div>
            </div>
          </LocaleTabs>
        </Card>

        <Card
          title="Sections"
          description="Guests can read the first 40% of the section text; the rest requires sign-in. Markdown: ## headings, - lists, **bold**, [links](https://…)."
          actions={
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() =>
                set("sections", [
                  ...v.sections,
                  { kind: "CONTENT", heading: "", headingKm: "", body: "", bodyKm: "", image: null },
                ])
              }
            >
              + Add section
            </button>
          }
        >
          {errAt(errors, "sections") && <p className="text-xs font-medium text-danger">{errors.sections}</p>}
          {v.sections.map((s, i) => (
            <fieldset key={i} className="rounded-lg border border-line p-4" data-testid="guidance-section">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Section {i + 1}</legend>
                <RowControls
                  index={i}
                  count={v.sections.length}
                  label={`section ${i + 1}`}
                  onMove={(to) => set("sections", moveItem(v.sections, i, to))}
                  onRemove={() =>
                    set(
                      "sections",
                      v.sections.filter((_, j) => j !== i),
                    )
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <SelectInput
                  label="Type"
                  emptyLabel={null}
                  value={s.kind}
                  onChange={(x) => setSection(i, { kind: x as GuidanceSectionValue["kind"] })}
                  options={[
                    { value: "CONTENT", label: "Content" },
                    { value: "NOTE", label: "Note" },
                    { value: "WARNING", label: "Warning" },
                  ]}
                />
                <TextInput
                  label={loc === "en" ? "Heading" : "Heading (Khmer)"}
                  required={loc === "en"}
                  lang={loc}
                  value={loc === "en" ? s.heading : s.headingKm}
                  onChange={(x) => setSection(i, loc === "en" ? { heading: x } : { headingKm: x })}
                  error={loc === "en" ? errAt(errors, `sections.${i}.heading`) : undefined}
                />
              </div>
              <div className="mt-4 space-y-4">
                <TextArea
                  label={loc === "en" ? "Text" : "Text (Khmer)"}
                  required={loc === "en"}
                  lang={loc}
                  rows={6}
                  value={loc === "en" ? s.body : s.bodyKm}
                  onChange={(x) => setSection(i, loc === "en" ? { body: x } : { bodyKm: x })}
                  error={loc === "en" ? errAt(errors, `sections.${i}.body`) : undefined}
                />
                <MediaPicker label="Image (optional)" value={s.image} onChange={(m) => setSection(i, { image: m })} />
              </div>
            </fieldset>
          ))}
        </Card>

        <Card
          title="Sources & references"
          description="Cite official sources for legal, immigration, tax or business information."
          actions={
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() => set("references", [...v.references, { title: "", titleKm: "", url: "", publisher: "" }])}
            >
              + Add reference
            </button>
          }
        >
          {v.references.length === 0 && <p className="text-sm text-muted">No references yet.</p>}
          {v.references.map((r, i) => (
            <fieldset key={i} className="rounded-lg border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <legend className="text-sm font-semibold">Reference {i + 1}</legend>
                <RowControls
                  index={i}
                  count={v.references.length}
                  label={`reference ${i + 1}`}
                  onMove={(to) => set("references", moveItem(v.references, i, to))}
                  onRemove={() =>
                    set(
                      "references",
                      v.references.filter((_, j) => j !== i),
                    )
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Title"
                  required
                  value={r.title}
                  onChange={(x) => setRef(i, { title: x })}
                  error={errAt(errors, `references.${i}.title`)}
                />
                <TextInput
                  label="Title (Khmer)"
                  lang="km"
                  value={r.titleKm}
                  onChange={(x) => setRef(i, { titleKm: x })}
                />
                <TextInput
                  label="URL"
                  type="url"
                  required
                  placeholder="https://"
                  value={r.url}
                  onChange={(x) => setRef(i, { url: x })}
                  error={errAt(errors, `references.${i}.url`)}
                />
                <TextInput label="Publisher" value={r.publisher} onChange={(x) => setRef(i, { publisher: x })} />
              </div>
            </fieldset>
          ))}
        </Card>
      </div>

      <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
        <Card title="Publishing">
          <SelectInput
            label="Journey"
            required
            emptyLabel="— Choose —"
            value={v.journeyId}
            onChange={(x) => set("journeyId", x)}
            options={journeys}
            error={errors.journeyId}
          />
          <SelectInput
            label="Status"
            emptyLabel={null}
            value={v.status}
            onChange={(x) => set("status", x as GuidanceFormValues["status"])}
            options={statusOptions}
            error={errors.status}
          />
          <TextInput
            label="Slug"
            value={v.slug}
            onChange={(x) => set("slug", x)}
            hint="Leave empty to generate from the title."
            error={errors.slug}
          />
          {canPublish && (
            <>
              <Checkbox
                label="Featured on the homepage"
                checked={v.isFeatured}
                onChange={(x) => set("isFeatured", x)}
              />
              <TextInput label="Order" type="number" value={v.sortOrder} onChange={(x) => set("sortOrder", x)} />
            </>
          )}
          <TextInput
            label="Last reviewed"
            type="date"
            value={v.lastReviewedAt}
            onChange={(x) => set("lastReviewedAt", x)}
            hint={
              canPublish
                ? `Set when the content was checked against its sources.${v.reviewedBy ? ` Reviewed by ${v.reviewedBy}.` : ""}`
                : "Only editors can set the review date."
            }
            error={errors.lastReviewedAt}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            {id && (
              <Link href={`/admin/preview/guidance/${id}`} target="_blank" className="btn-secondary">
                Preview
              </Link>
            )}
          </div>
          {id && canDelete && (
            <button
              type="button"
              className="text-sm text-danger hover:underline"
              onClick={() => {
                if (!confirm("Delete this guide permanently?")) return;
                start(async () => {
                  const res = await deleteGuidance(id);
                  if (res.ok) router.push("/admin/guidance?deleted=1");
                  else setMessage({ kind: "error", text: res.message });
                });
              }}
            >
              Delete
            </button>
          )}
        </Card>
        <Card title="Media">
          <MediaPicker label="Cover image" value={v.cover} onChange={(m) => set("cover", m)} />
          <MediaPicker
            label="Video (optional)"
            kind="video"
            value={v.video}
            onChange={(m) => set("video", m)}
            hint="MP4 or WebM, up to 50 MB. Shown instead of the cover."
          />
        </Card>
      </div>
    </form>
  );
}
