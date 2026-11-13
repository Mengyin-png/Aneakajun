"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { JOURNEY_ICONS } from "@/lib/validation/journeys";
import { saveJourney } from "@/server/actions/journeys-admin";
import { Card, Checkbox, FormAlert, SelectInput, TextArea, TextInput } from "./controls";
import { MediaPicker, type PickedMedia } from "./media-picker";

export type JourneyValues = {
  id: string;
  key: string;
  title: string;
  titleKm: string;
  verb: string;
  verbKm: string;
  description: string;
  descriptionKm: string;
  icon: string;
  accentColor: string;
  cover: PickedMedia;
  video: PickedMedia;
  isEnabled: boolean;
  sortOrder: number | string;
};

export function JourneyEditor({ initial }: { initial: JourneyValues }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const f = (k: "title" | "titleKm" | "verb" | "verbKm" | "description" | "descriptionKm" | "accentColor") => ({
    value: v[k],
    onChange: (x: string) => setV((s) => ({ ...s, [k]: x })),
    error: errors[k],
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const { id, key: _key, cover, video, ...rest } = v;
          void _key;
          const res = await saveJourney(id, { ...rest, coverId: cover?.id ?? null, videoId: video?.id ?? null });
          setErrors(res.ok ? {} : (res.errors ?? {}));
          setMessage({ kind: res.ok ? "success" : "error", text: res.ok ? (res.message ?? "Saved.") : res.message });
          if (res.ok) router.refresh();
        });
      }}
    >
      <Card title={`${v.title} — /${v.key}`} description="The URL key is fixed; everything else is editable.">
        {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Title" required {...f("title")} />
          <TextInput label="Title (Khmer)" lang="km" {...f("titleKm")} />
          <TextInput label="Hero option (verb)" required hint="Shown in “I want to … in Cambodia.”" {...f("verb")} />
          <TextInput label="Hero option (Khmer)" lang="km" {...f("verbKm")} />
          <TextArea label="Description" rows={3} {...f("description")} />
          <TextArea label="Description (Khmer)" lang="km" rows={3} {...f("descriptionKm")} />
          <SelectInput
            label="Icon"
            emptyLabel={null}
            value={v.icon}
            onChange={(x) => setV((s) => ({ ...s, icon: x }))}
            options={JOURNEY_ICONS.map((i) => ({ value: i, label: i }))}
          />
          <TextInput label="Accent colour" placeholder="#09786a" {...f("accentColor")} />
          <MediaPicker label="Cover image" value={v.cover} onChange={(m) => setV((s) => ({ ...s, cover: m }))} />
          <MediaPicker
            label="Video (optional)"
            kind="video"
            value={v.video}
            onChange={(m) => setV((s) => ({ ...s, video: m }))}
          />
          <TextInput
            label="Order"
            type="number"
            value={v.sortOrder}
            onChange={(x) => setV((s) => ({ ...s, sortOrder: x }))}
            error={errors.sortOrder}
          />
          <div className="self-end pb-2">
            <Checkbox
              label="Enabled (visible on the site)"
              checked={v.isEnabled}
              onChange={(x) => setV((s) => ({ ...s, isEnabled: x }))}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : `Save ${v.title}`}
        </button>
      </Card>
    </form>
  );
}
