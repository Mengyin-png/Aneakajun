"use client";

import { useId, useMemo, useState } from "react";

type Base = { label: string; error?: string; hint?: string; required?: boolean; className?: string };

function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: Base & { id: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
  lang,
  ...base
}: Base & {
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  lang?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <input
        id={id}
        type={type}
        lang={lang}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={base.error ? `${id}-err` : undefined}
        className="input"
      />
    </FieldShell>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  lang,
  ...base
}: Base & { value: string | null | undefined; onChange: (v: string) => void; rows?: number; lang?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <textarea
        id={id}
        rows={rows}
        lang={lang}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={base.error ? `${id}-err` : undefined}
        className="input resize-y leading-relaxed"
      />
    </FieldShell>
  );
}

export type Option = { value: string; label: string };

export function SelectInput({
  value,
  onChange,
  options,
  emptyLabel = "— None —",
  ...base
}: Base & {
  value: string | null | undefined;
  onChange: (v: string) => void;
  options: Option[];
  emptyLabel?: string | null;
}) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={base.error ? `${id}-err` : undefined}
        className="input"
      >
        {emptyLabel !== null && <option value="">{emptyLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start gap-2.5 text-sm ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-[var(--color-brand)]"
      />
      <span>
        <span className="font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Searchable checklist for many-to-many relations (skills, tags, related people…). */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: Option[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [filter, setFilter] = useState("");
  const id = useId();
  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return f ? options.filter((o) => o.label.toLowerCase().includes(f)) : options;
  }, [filter, options]);
  const selected = options.filter((o) => value.includes(o.value));

  return (
    <fieldset>
      <legend className="label">{label}</legend>
      {selected.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== o.value))}
                className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-white"
                aria-label={`Remove ${o.label}`}
              >
                {o.label} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="search"
        placeholder="Filter…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="input mb-1.5"
        aria-label={`Filter ${label}`}
      />
      <div className="max-h-48 overflow-y-auto rounded-lg border border-line bg-white p-1">
        {visible.length === 0 ? (
          <p className="p-2 text-xs text-muted">No matches.</p>
        ) : (
          visible.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-canvas"
            >
              <input
                type="checkbox"
                checked={value.includes(o.value)}
                onChange={(e) => onChange(e.target.checked ? [...value, o.value] : value.filter((v) => v !== o.value))}
                className="size-4 accent-[var(--color-brand)]"
              />
              {o.label}
            </label>
          ))
        )}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </fieldset>
  );
}

export function Card({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FormAlert({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-lg px-4 py-3 text-sm ${kind === "error" ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}
    >
      {children}
    </p>
  );
}

/** EN / KM tabs for bilingual fields. Shows a dot when the Khmer version has content. */
export function LocaleTabs({
  active,
  onChange,
  kmFilled,
  children,
}: {
  active: "en" | "km";
  onChange: (l: "en" | "km") => void;
  kmFilled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        role="tablist"
        aria-label="Content language"
        className="mb-4 inline-flex rounded-lg border border-line bg-canvas p-0.5"
      >
        {(["en", "km"] as const).map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={active === l}
            onClick={() => onChange(l)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${active === l ? "bg-white text-ink shadow-xs" : "text-ink-soft"}`}
          >
            {l === "en" ? "English (required)" : "ខ្មែរ Khmer"}
            {l === "km" && kmFilled && (
              <span
                className="ml-1.5 inline-block size-1.5 rounded-full bg-success align-middle"
                aria-label="has content"
              />
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel">{children}</div>
    </div>
  );
}
