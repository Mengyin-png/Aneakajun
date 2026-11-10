"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TaxonomyKind } from "@/lib/validation/admin";
import { deleteTaxonomy, saveTaxonomy } from "@/server/actions/taxonomy";
import { Checkbox, FormAlert, SelectInput, TextInput, type Option } from "./controls";

export type TaxonomyRow = {
  id: string;
  name: string;
  nameKm: string | null;
  slug: string;
  type?: string;
  parentId?: string | null;
  parentName?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
  usage: number;
};

type Draft = {
  id?: string;
  name: string;
  nameKm: string;
  slug: string;
  type: string;
  parentId: string;
  isFeatured: boolean;
  sortOrder: string;
};

const blank = (type = ""): Draft => ({
  name: "",
  nameKm: "",
  slug: "",
  type,
  parentId: "",
  isFeatured: false,
  sortOrder: "0",
});

/** List + inline editor for categories, tags, skills and locations. */
export function TaxonomyManager({
  kind,
  rows,
  typeOptions,
  parentOptions,
}: {
  kind: TaxonomyKind;
  rows: TaxonomyRow[];
  typeOptions?: Option[];
  parentOptions?: Option[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(blank(typeOptions?.[0]?.value));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await saveTaxonomy(kind, { ...draft, isFeatured: draft.isFeatured });
      if (res.ok) {
        setErrors({});
        setMessage({ kind: "success", text: draft.id ? "Saved." : "Added." });
        setDraft(blank(draft.type));
        router.refresh();
      } else {
        setErrors(res.errors ?? {});
        setMessage({ kind: "error", text: res.message });
      }
    });
  };

  const remove = (row: TaxonomyRow) => {
    const warning = row.usage > 0 ? ` It is used by ${row.usage} item(s); they will keep existing without it.` : "";
    if (!window.confirm(`Delete “${row.name}”?${warning}`)) return;
    start(async () => {
      const res = await deleteTaxonomy(kind, row.id);
      setMessage(res.ok ? { kind: "success", text: "Deleted." } : { kind: "error", text: res.message });
      if (res.ok) router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Khmer
              </th>
              {typeOptions && (
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Type
                </th>
              )}
              {parentOptions && (
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Parent
                </th>
              )}
              <th scope="col" className="px-4 py-2.5 font-medium">
                Used
              </th>
              <th scope="col" className="px-4 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5">
                  <span className="font-medium text-ink">{r.name}</span>
                  {r.isFeatured && <span className="ml-1.5 text-xs text-gold">★</span>}
                  <span className="block text-xs text-muted">{r.slug}</span>
                </td>
                <td className="px-4 py-2.5" lang="km">
                  {r.nameKm ?? <span className="text-muted">—</span>}
                </td>
                {typeOptions && (
                  <td className="px-4 py-2.5 text-muted">{typeOptions.find((t) => t.value === r.type)?.label}</td>
                )}
                {parentOptions && <td className="px-4 py-2.5 text-muted">{r.parentName ?? "—"}</td>}
                <td className="px-4 py-2.5 tabular-nums text-muted">{r.usage}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    className="text-brand hover:underline"
                    onClick={() => {
                      setErrors({});
                      setMessage(null);
                      setDraft({
                        id: r.id,
                        name: r.name,
                        nameKm: r.nameKm ?? "",
                        slug: r.slug,
                        type: r.type ?? "",
                        parentId: r.parentId ?? "",
                        isFeatured: r.isFeatured ?? false,
                        sortOrder: String(r.sortOrder ?? 0),
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ml-3 text-danger hover:underline"
                    onClick={() => remove(r)}
                    disabled={pending}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-muted">None yet.</p>}
      </div>

      <form onSubmit={save} noValidate className="card space-y-4 self-start p-5 lg:sticky lg:top-20">
        <h2 className="font-semibold">{draft.id ? "Edit" : "Add new"}</h2>
        {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
        <TextInput
          label="Name (English)"
          required
          value={draft.name}
          onChange={(name) => set({ name })}
          error={errors.name}
        />
        <TextInput
          label="Name (Khmer)"
          lang="km"
          value={draft.nameKm}
          onChange={(nameKm) => set({ nameKm })}
          error={errors.nameKm}
        />
        <TextInput
          label="Slug"
          value={draft.slug}
          onChange={(slug) => set({ slug })}
          error={errors.slug}
          hint="Leave empty to generate."
        />
        {typeOptions && (
          <SelectInput
            label="Type"
            value={draft.type}
            onChange={(type) => set({ type })}
            options={typeOptions}
            emptyLabel={null}
            error={errors.type}
          />
        )}
        {parentOptions && (
          <SelectInput
            label="Parent"
            value={draft.parentId}
            onChange={(parentId) => set({ parentId })}
            options={parentOptions.filter((o) => o.value !== draft.id)}
            error={errors.parentId}
          />
        )}
        {kind === "categories" && (
          <Checkbox
            label="Featured on homepage"
            checked={draft.isFeatured}
            onChange={(isFeatured) => set({ isFeatured })}
            hint="Applies to industry categories."
          />
        )}
        {(kind === "categories" || kind === "locations") && (
          <TextInput
            label="Display order"
            type="number"
            value={draft.sortOrder}
            onChange={(sortOrder) => set({ sortOrder })}
            error={errors.sortOrder}
          />
        )}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Saving…" : draft.id ? "Save" : "Add"}
          </button>
          {draft.id && (
            <button type="button" className="btn-secondary" onClick={() => setDraft(blank(typeOptions?.[0]?.value))}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
