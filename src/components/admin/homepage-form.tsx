"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveHomepage } from "@/server/actions/journeys-admin";
import { Card, Checkbox, FormAlert, TextInput } from "./controls";
import { errAt, moveItem, RowControls } from "./list-editor";
import { MediaPicker, type PickedMedia } from "./media-picker";

type Resource = { title: string; titleKm: string; url: string; description: string; descriptionKm: string };
export type HomepageValues = {
  heroPrefix: string;
  heroPrefixKm: string;
  heroSuffix: string;
  heroSuffixKm: string;
  heroSubtitle: string;
  heroSubtitleKm: string;
  ctaLabel: string;
  ctaLabelKm: string;
  heroVideo: PickedMedia;
  heroImage: PickedMedia;
  sections: { key: string; enabled: boolean }[];
  resources: Resource[];
};

const SECTION_LABEL: Record<string, string> = {
  journeys: "Explore Cambodia (journey cards)",
  guidance: "Popular guidance",
  directory: "People & organizations (search, categories, featured)",
  articles: "Latest articles",
  resources: "Useful resources",
  cta: "Call to action band",
};

export function HomepageForm({ initial }: { initial: HomepageValues }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const f = (k: Exclude<keyof HomepageValues, "heroVideo" | "heroImage" | "sections" | "resources">) => ({
    value: v[k],
    onChange: (x: string) => setV((s) => ({ ...s, [k]: x })),
    error: errors[k],
  });
  const setRes = (i: number, patch: Partial<Resource>) =>
    setV((s) => ({ ...s, resources: s.resources.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));

  return (
    <form
      noValidate
      className="max-w-4xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const { heroVideo, heroImage, ...rest } = v;
          const res = await saveHomepage({
            ...rest,
            heroVideoId: heroVideo?.id ?? null,
            heroImageId: heroImage?.id ?? null,
          });
          setErrors(res.ok ? {} : (res.errors ?? {}));
          setMessage({ kind: res.ok ? "success" : "error", text: res.ok ? (res.message ?? "Saved.") : res.message });
          if (res.ok) router.refresh();
        });
      }}
    >
      {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
      <Card
        title="Hero sentence"
        description="“[Prefix] [Live / Visit / Business ▾] [suffix]” plus one button — the options come from Journeys."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Prefix" required {...f("heroPrefix")} />
          <TextInput label="Prefix (Khmer)" lang="km" {...f("heroPrefixKm")} />
          <TextInput label="Suffix" required {...f("heroSuffix")} />
          <TextInput label="Suffix (Khmer)" lang="km" {...f("heroSuffixKm")} />
          <TextInput label="Button label" required {...f("ctaLabel")} />
          <TextInput label="Button label (Khmer)" lang="km" {...f("ctaLabelKm")} />
        </div>
      </Card>
      <Card
        title="Hero media"
        description="The video plays muted on larger screens when motion is allowed; the image is the fallback on mobile."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaPicker
            label="Background video"
            kind="video"
            value={v.heroVideo}
            onChange={(m) => setV((s) => ({ ...s, heroVideo: m }))}
            hint="MP4 or WebM, up to 50 MB."
          />
          <MediaPicker
            label="Fallback / poster image"
            value={v.heroImage}
            onChange={(m) => setV((s) => ({ ...s, heroImage: m }))}
          />
        </div>
      </Card>
      <Card title="Sections" description="Order and visibility of homepage sections.">
        <ul className="space-y-2">
          {v.sections.map((s, i) => (
            <li
              key={s.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
            >
              <Checkbox
                label={SECTION_LABEL[s.key] ?? s.key}
                checked={s.enabled}
                onChange={(x) =>
                  setV((st) => ({ ...st, sections: st.sections.map((y, j) => (j === i ? { ...y, enabled: x } : y)) }))
                }
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="rounded border border-line px-2 py-1 text-xs disabled:opacity-40"
                  disabled={i === 0}
                  onClick={() => setV((st) => ({ ...st, sections: moveItem(st.sections, i, i - 1) }))}
                  aria-label={`Move ${s.key} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded border border-line px-2 py-1 text-xs disabled:opacity-40"
                  disabled={i === v.sections.length - 1}
                  onClick={() => setV((st) => ({ ...st, sections: moveItem(st.sections, i, i + 1) }))}
                  aria-label={`Move ${s.key} down`}
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card
        title="Useful resources"
        description="Links to official sources shown on the homepage."
        actions={
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={() =>
              setV((s) => ({
                ...s,
                resources: [...s.resources, { title: "", titleKm: "", url: "", description: "", descriptionKm: "" }],
              }))
            }
          >
            + Add resource
          </button>
        }
      >
        {v.resources.map((r, i) => (
          <fieldset key={i} className="rounded-lg border border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <legend className="text-sm font-semibold">Resource {i + 1}</legend>
              <RowControls
                index={i}
                count={v.resources.length}
                label={`resource ${i + 1}`}
                onMove={(to) => setV((s) => ({ ...s, resources: moveItem(s.resources, i, to) }))}
                onRemove={() => setV((s) => ({ ...s, resources: s.resources.filter((_, j) => j !== i) }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Title"
                required
                value={r.title}
                onChange={(x) => setRes(i, { title: x })}
                error={errAt(errors, `resources.${i}.title`)}
              />
              <TextInput
                label="Title (Khmer)"
                lang="km"
                value={r.titleKm}
                onChange={(x) => setRes(i, { titleKm: x })}
              />
              <TextInput
                label="URL"
                type="url"
                required
                value={r.url}
                onChange={(x) => setRes(i, { url: x })}
                error={errAt(errors, `resources.${i}.url`)}
              />
              <TextInput label="Description" value={r.description} onChange={(x) => setRes(i, { description: x })} />
              <TextInput
                label="Description (Khmer)"
                lang="km"
                value={r.descriptionKm}
                onChange={(x) => setRes(i, { descriptionKm: x })}
              />
            </div>
          </fieldset>
        ))}
      </Card>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save homepage"}
      </button>
    </form>
  );
}
