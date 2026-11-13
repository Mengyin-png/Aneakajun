"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitJourneyForm } from "@/server/actions/journey-forms";
import type { PublicForm } from "@/server/queries/journeys";

type Labels = { submit: string; sending: string; success: string; required: string };

/** Renders a CMS-defined form. The server re-validates everything on submit. */
export function DynamicForm({ form, locale, labels }: { form: PublicForm; locale: string; labels: Labels }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: Record<string, unknown> = {};
    for (const f of form.fields) {
      if (f.type === "CHECKBOX")
        values[f.key] = f.options?.length ? fd.getAll(f.key).map(String) : fd.get(f.key) === "on";
      else values[f.key] = fd.get(f.key)?.toString() ?? "";
    }
    const formEl = e.currentTarget;
    start(async () => {
      const res = await submitJourneyForm({
        formId: form.id,
        values,
        locale,
        website: fd.get("website")?.toString() ?? "",
      });
      if (res.ok) {
        setErrors({});
        setMessage({ ok: true, text: labels.success });
        formEl.reset();
        router.refresh();
      } else {
        setErrors(res.errors ?? {});
        setMessage({ ok: false, text: res.message });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" data-testid="journey-form">
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`rounded p-4 text-[15px] ${message.ok ? "bg-[#eaf5f3] text-brand" : "bg-red-50 text-red-700"}`}
        >
          {message.text}
        </p>
      )}
      {/* Honeypot (hidden from people and assistive tech). */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {form.fields.map((f) => {
        const id = `f-${f.key}`;
        const err = errors[f.key];
        const describedBy =
          [f.helpText ? `${id}-help` : null, err ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
        const common = {
          id,
          name: f.key,
          "aria-invalid": err ? true : undefined,
          "aria-describedby": describedBy,
          required: f.required,
        } as const;
        const v = f.validation ?? {};
        const labelEl = (
          <span className="label">
            {f.label}
            {f.required && (
              <span className="text-red-600" aria-label={labels.required}>
                {" "}
                *
              </span>
            )}
          </span>
        );

        let control: React.ReactNode;
        if (f.type === "TEXTAREA") {
          control = (
            <textarea
              {...common}
              rows={5}
              className="input min-h-28 py-2"
              placeholder={f.placeholder ?? undefined}
              maxLength={v.maxLength}
            />
          );
        } else if (f.type === "SELECT") {
          control = (
            <select {...common} className="input" defaultValue="">
              <option value="">—</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        } else if (f.type === "RADIO" || (f.type === "CHECKBOX" && f.options?.length)) {
          return (
            <fieldset key={f.key} aria-describedby={describedBy} aria-invalid={err ? true : undefined}>
              <legend className="mb-2">{labelEl}</legend>
              <div className="space-y-2">
                {f.options?.map((o) => (
                  <label key={o.value} className="flex items-center gap-2.5 text-[15px]">
                    <input
                      type={f.type === "RADIO" ? "radio" : "checkbox"}
                      name={f.key}
                      value={o.value}
                      className="size-4 accent-[#09786a]"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
              {f.helpText && (
                <p id={`${id}-help`} className="mt-1 text-sm text-muted">
                  {f.helpText}
                </p>
              )}
              {err && (
                <p id={`${id}-err`} className="mt-1 text-sm text-red-700">
                  {err}
                </p>
              )}
            </fieldset>
          );
        } else if (f.type === "CHECKBOX") {
          return (
            <div key={f.key}>
              <label className="flex items-start gap-2.5 text-[15px]">
                <input {...common} type="checkbox" className="mt-1 size-4 accent-[#09786a]" />
                <span>
                  {f.label}
                  {f.required && <span className="text-red-600"> *</span>}
                </span>
              </label>
              {f.helpText && (
                <p id={`${id}-help`} className="mt-1 text-sm text-muted">
                  {f.helpText}
                </p>
              )}
              {err && (
                <p id={`${id}-err`} className="mt-1 text-sm text-red-700">
                  {err}
                </p>
              )}
            </div>
          );
        } else {
          const type = { TEXT: "text", EMAIL: "email", NUMBER: "number", DATE: "date" }[f.type] ?? "text";
          control = (
            <input
              {...common}
              type={type}
              className="input"
              placeholder={f.placeholder ?? undefined}
              maxLength={type === "text" || type === "email" ? v.maxLength : undefined}
              min={type === "number" ? v.min : undefined}
              max={type === "number" ? v.max : undefined}
            />
          );
        }
        return (
          <div key={f.key}>
            <label htmlFor={id} className="mb-1.5 block">
              {labelEl}
            </label>
            {control}
            {f.helpText && (
              <p id={`${id}-help`} className="mt-1 text-sm text-muted">
                {f.helpText}
              </p>
            )}
            {err && (
              <p id={`${id}-err`} className="mt-1 text-sm text-red-700">
                {err}
              </p>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary inline-flex h-[43px] items-center gap-2 px-7 disabled:opacity-60"
      >
        {pending && (
          <svg
            className="size-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {pending ? labels.sending : (form.submitLabel ?? labels.submit)}
      </button>
    </form>
  );
}
