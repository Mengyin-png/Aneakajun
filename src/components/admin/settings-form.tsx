"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSettings } from "@/server/actions/settings";
import { Card, FormAlert, TextArea, TextInput } from "./controls";

export type SettingsValues = Record<
  | "siteName"
  | "siteNameKm"
  | "tagline"
  | "taglineKm"
  | "description"
  | "descriptionKm"
  | "contactEmail"
  | "contactPhone"
  | "address"
  | "addressKm"
  | "facebookUrl"
  | "telegramUrl"
  | "youtubeUrl"
  | "linkedinUrl"
  | "footerNote"
  | "footerNoteKm",
  string
>;

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const f = (k: keyof SettingsValues) => ({
    value: v[k],
    onChange: (val: string) => setV((s) => ({ ...s, [k]: val })),
    error: errors[k],
  });

  return (
    <form
      noValidate
      className="max-w-4xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateSettings(v);
          setErrors(res.ok ? {} : (res.errors ?? {}));
          setMessage({ kind: res.ok ? "success" : "error", text: res.ok ? (res.message ?? "Saved.") : res.message });
          if (res.ok) router.refresh();
        });
      }}
    >
      {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
      <Card title="Identity" description="Shown in the header, footer, page titles and search-engine results.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Site name" required {...f("siteName")} />
          <TextInput label="Site name (Khmer)" lang="km" {...f("siteNameKm")} />
          <TextInput label="Tagline" {...f("tagline")} />
          <TextInput label="Tagline (Khmer)" lang="km" {...f("taglineKm")} />
          <TextArea label="Description" rows={3} {...f("description")} />
          <TextArea label="Description (Khmer)" lang="km" rows={3} {...f("descriptionKm")} />
        </div>
      </Card>
      <Card title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Contact email" type="email" {...f("contactEmail")} />
          <TextInput label="Phone" {...f("contactPhone")} />
          <TextInput label="Address" {...f("address")} />
          <TextInput label="Address (Khmer)" lang="km" {...f("addressKm")} />
        </div>
      </Card>
      <Card title="Social media">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Facebook" type="url" placeholder="https://" {...f("facebookUrl")} />
          <TextInput label="Telegram" type="url" placeholder="https://" {...f("telegramUrl")} />
          <TextInput label="YouTube" type="url" placeholder="https://" {...f("youtubeUrl")} />
          <TextInput label="LinkedIn" type="url" placeholder="https://" {...f("linkedinUrl")} />
        </div>
      </Card>
      <Card title="Footer">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Footer note" {...f("footerNote")} />
          <TextInput label="Footer note (Khmer)" lang="km" {...f("footerNoteKm")} />
        </div>
      </Card>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
