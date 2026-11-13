"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FIELD_TYPES, type FieldType } from "@/lib/forms/schema";
import { deleteJourneyForm, saveJourneyForm } from "@/server/actions/journeys-admin";
import { Card, Checkbox, FormAlert, SelectInput, TextInput, type Option } from "./controls";
import { errAt, moveItem, RowControls } from "./list-editor";

export type BuilderField = {
  id: string | null;
  key: string;
  type: FieldType;
  label: string;
  labelKm: string;
  helpText: string;
  helpTextKm: string;
  placeholder: string;
  required: boolean;
  /** One option per line: value | English label | Khmer label */
  optionsText: string;
  minLength: string;
  maxLength: string;
  min: string;
  max: string;
};
export type BuilderValues = {
  journeyId: string;
  title: string;
  titleKm: string;
  description: string;
  descriptionKm: string;
  submitLabel: string;
  submitLabelKm: string;
  isActive: boolean;
  fields: BuilderField[];
};

const TYPE_LABEL: Record<FieldType, string> = {
  TEXT: "Short text",
  EMAIL: "Email",
  NUMBER: "Number",
  DATE: "Date",
  TEXTAREA: "Long text",
  SELECT: "Dropdown",
  CHECKBOX: "Checkbox(es)",
  RADIO: "Radio buttons",
};
const HAS_OPTIONS = new Set<FieldType>(["SELECT", "RADIO", "CHECKBOX"]);
const HAS_LENGTH = new Set<FieldType>(["TEXT", "TEXTAREA", "EMAIL"]);

export const emptyField = (n: number): BuilderField => ({
  id: null,
  key: `field_${n}`,
  type: "TEXT",
  label: "",
  labelKm: "",
  helpText: "",
  helpTextKm: "",
  placeholder: "",
  required: false,
  optionsText: "",
  minLength: "",
  maxLength: "",
  min: "",
  max: "",
});

function parseOptionsText(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [value, label, labelKm] = l.split("|").map((x) => x.trim());
      return { value, label: label || value, labelKm: labelKm || null };
    });
}
const num = (s: string) => (s.trim() === "" ? undefined : Number(s));

export function FormBuilder({
  id,
  initial,
  journeys,
}: {
  id: string | null;
  initial: BuilderValues;
  journeys: Option[];
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const f = (k: "title" | "titleKm" | "description" | "descriptionKm" | "submitLabel" | "submitLabelKm") => ({
    value: v[k],
    onChange: (x: string) => setV((s) => ({ ...s, [k]: x })),
    error: errors[k],
  });
  const setField = (i: number, patch: Partial<BuilderField>) =>
    setV((s) => ({ ...s, fields: s.fields.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveJourneyForm(id, {
        journeyId: v.journeyId || null,
        title: v.title,
        titleKm: v.titleKm,
        description: v.description,
        descriptionKm: v.descriptionKm,
        submitLabel: v.submitLabel,
        submitLabelKm: v.submitLabelKm,
        isActive: v.isActive,
        fields: v.fields.map((x) => ({
          id: x.id,
          key: x.key,
          type: x.type,
          label: x.label,
          labelKm: x.labelKm,
          helpText: x.helpText,
          helpTextKm: x.helpTextKm,
          placeholder: x.placeholder,
          required: x.required,
          options: HAS_OPTIONS.has(x.type) ? parseOptionsText(x.optionsText) : [],
          validation: Object.fromEntries(
            Object.entries(
              HAS_LENGTH.has(x.type)
                ? { minLength: num(x.minLength), maxLength: num(x.maxLength) }
                : x.type === "NUMBER"
                  ? { min: num(x.min), max: num(x.max) }
                  : {},
            ).filter(([, val]) => val !== undefined),
          ),
        })),
      });
      setErrors(res.ok ? {} : (res.errors ?? {}));
      setMessage({ kind: res.ok ? "success" : "error", text: res.ok ? (res.message ?? "Saved.") : res.message });
      if (res.ok) {
        if (!id) router.push(`/admin/forms/${res.data.id}?created=1`);
        else router.refresh();
      }
    });
  }

  const fieldError = (i: number) =>
    Object.entries(errors)
      .filter(([k]) => k.startsWith(`fields.${i}.`) && !k.endsWith(".key") && !k.endsWith(".label"))
      .map(([, m]) => m)
      .join(" ");

  return (
    <form noValidate onSubmit={submit} className="max-w-5xl space-y-6">
      {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
      <Card title="Form">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Journey"
            emptyLabel="— Not assigned —"
            value={v.journeyId}
            onChange={(x) => setV((s) => ({ ...s, journeyId: x }))}
            options={journeys}
            hint="The most recently updated active form is shown on the journey's form page."
          />
          <div className="self-end pb-2">
            <Checkbox
              label="Active (accepting submissions)"
              checked={v.isActive}
              onChange={(x) => setV((s) => ({ ...s, isActive: x }))}
            />
          </div>
          <TextInput label="Title" required {...f("title")} />
          <TextInput label="Title (Khmer)" lang="km" {...f("titleKm")} />
          <TextInput label="Description" {...f("description")} />
          <TextInput label="Description (Khmer)" lang="km" {...f("descriptionKm")} />
          <TextInput label="Submit button label" {...f("submitLabel")} />
          <TextInput label="Submit button label (Khmer)" lang="km" {...f("submitLabelKm")} />
        </div>
      </Card>

      <Card
        title={`Fields (${v.fields.length})`}
        description="Changing or removing fields never alters past submissions — answers keep a copy of the label."
        actions={
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={() => setV((s) => ({ ...s, fields: [...s.fields, emptyField(s.fields.length + 1)] }))}
          >
            + Add field
          </button>
        }
      >
        {v.fields.length === 0 && <p className="text-sm text-muted">No fields yet.</p>}
        {v.fields.map((x, i) => (
          <fieldset key={x.id ?? `new-${i}`} className="rounded-lg border border-line p-4" data-testid="builder-field">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <legend className="text-sm font-semibold">
                {i + 1}. {x.label || "Untitled field"}{" "}
                <span className="font-normal text-muted">· {TYPE_LABEL[x.type]}</span>
              </legend>
              <RowControls
                index={i}
                count={v.fields.length}
                label={`field ${i + 1}`}
                onMove={(to) => setV((s) => ({ ...s, fields: moveItem(s.fields, i, to) }))}
                onRemove={() => setV((s) => ({ ...s, fields: s.fields.filter((_, j) => j !== i) }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextInput
                label="Label"
                required
                value={x.label}
                onChange={(val) => setField(i, { label: val })}
                error={errAt(errors, `fields.${i}.label`)}
              />
              <TextInput
                label="Label (Khmer)"
                lang="km"
                value={x.labelKm}
                onChange={(val) => setField(i, { labelKm: val })}
              />
              <SelectInput
                label="Type"
                emptyLabel={null}
                value={x.type}
                onChange={(val) => setField(i, { type: val as FieldType })}
                options={FIELD_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))}
              />
              <TextInput
                label="Key"
                required
                value={x.key}
                onChange={(val) => setField(i, { key: val })}
                hint="Stable machine name."
                error={errAt(errors, `fields.${i}.key`)}
              />
              <TextInput label="Help text" value={x.helpText} onChange={(val) => setField(i, { helpText: val })} />
              <TextInput
                label="Help text (Khmer)"
                lang="km"
                value={x.helpTextKm}
                onChange={(val) => setField(i, { helpTextKm: val })}
              />
              {!HAS_OPTIONS.has(x.type) && (
                <TextInput
                  label="Placeholder"
                  value={x.placeholder}
                  onChange={(val) => setField(i, { placeholder: val })}
                />
              )}
              {HAS_LENGTH.has(x.type) && (
                <>
                  <TextInput
                    label="Min length"
                    type="number"
                    value={x.minLength}
                    onChange={(val) => setField(i, { minLength: val })}
                  />
                  <TextInput
                    label="Max length"
                    type="number"
                    value={x.maxLength}
                    onChange={(val) => setField(i, { maxLength: val })}
                  />
                </>
              )}
              {x.type === "NUMBER" && (
                <>
                  <TextInput
                    label="Minimum"
                    type="number"
                    value={x.min}
                    onChange={(val) => setField(i, { min: val })}
                  />
                  <TextInput
                    label="Maximum"
                    type="number"
                    value={x.max}
                    onChange={(val) => setField(i, { max: val })}
                  />
                </>
              )}
            </div>
            {HAS_OPTIONS.has(x.type) && (
              <div className="mt-4">
                <label className="label" htmlFor={`opts-${i}`}>
                  Options
                </label>
                <textarea
                  id={`opts-${i}`}
                  rows={4}
                  className="input font-mono text-xs"
                  value={x.optionsText}
                  onChange={(e) => setField(i, { optionsText: e.target.value })}
                  placeholder={"value | English label | Khmer label\nyes | Yes | បាទ/ចាស"}
                />
                <p className="mt-1 text-xs text-muted">
                  One per line.{" "}
                  {x.type === "CHECKBOX" ? "Leave empty for a single yes/no checkbox (e.g. consent)." : ""}
                </p>
              </div>
            )}
            <div className="mt-4">
              <Checkbox label="Required" checked={x.required} onChange={(val) => setField(i, { required: val })} />
            </div>
            {fieldError(i) && <p className="mt-2 text-xs font-medium text-danger">{fieldError(i)}</p>}
          </fieldset>
        ))}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save form"}
        </button>
        {id && (
          <button
            type="button"
            className="text-sm text-danger hover:underline"
            onClick={() => {
              if (!confirm("Delete this form? Forms with submissions are deactivated instead.")) return;
              start(async () => {
                const res = await deleteJourneyForm(id);
                if (!res.ok) return setMessage({ kind: "error", text: res.message });
                if (res.data.deactivated) {
                  setMessage({ kind: "success", text: res.message ?? "Deactivated." });
                  setV((s) => ({ ...s, isActive: false }));
                  router.refresh();
                } else router.push("/admin/forms?deleted=1");
              });
            }}
          >
            Delete form
          </button>
        )}
      </div>
    </form>
  );
}
