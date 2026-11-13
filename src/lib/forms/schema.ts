import { z } from "zod";

/**
 * Dynamic form definitions → runtime validation. Used on the server for every
 * submission (the browser only mirrors required/format hints).
 */
export const FIELD_TYPES = ["TEXT", "EMAIL", "NUMBER", "DATE", "TEXTAREA", "SELECT", "CHECKBOX", "RADIO"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export type FieldOption = { value: string; label: string; labelKm?: string | null };
export type FieldValidation = { minLength?: number; maxLength?: number; min?: number; max?: number };

export type FieldDef = {
  key: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: FieldOption[] | null;
  validation?: FieldValidation | null;
};

export const optionsSchema = z
  .array(
    z.object({
      value: z
        .string()
        .trim()
        .min(1)
        .max(80)
        .regex(/^[a-z0-9_-]+$/i, "Option values use letters, numbers, - and _."),
      label: z.string().trim().min(1).max(200),
      labelKm: z.string().trim().max(200).nullish(),
    }),
  )
  .max(50);

export const validationSchema = z
  .object({
    minLength: z.number().int().min(0).max(10000).optional(),
    maxLength: z.number().int().min(1).max(10000).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .partial();

/** Reads stored options, keeping every valid one (a single bad entry never hides the rest). */
export function parseOptions(raw: unknown): FieldOption[] {
  if (!Array.isArray(raw)) return [];
  const item = optionsSchema.element;
  return raw
    .flatMap((o) => {
      const r = item.safeParse(o);
      return r.success ? [r.data] : [];
    })
    .slice(0, 50);
}
export function parseValidation(raw: unknown): FieldValidation {
  const r = validationSchema.safeParse(raw);
  return r.success ? r.data : {};
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_MAX = { TEXT: 300, EMAIL: 254, TEXTAREA: 5000 } as const;

function fieldSchema(f: FieldDef): z.ZodType<unknown> {
  const v = f.validation ?? {};
  const opts = (f.options ?? []).map((o) => o.value);
  const req = `${f.label} is required.`;
  const emptyToUndefined = (x: unknown) => (typeof x === "string" && x.trim() === "" ? undefined : x);

  switch (f.type) {
    case "TEXT":
    case "TEXTAREA":
    case "EMAIL": {
      let s = z
        .string()
        .trim()
        .max(v.maxLength ?? DEFAULT_MAX[f.type], `${f.label} is too long.`);
      if (v.minLength) s = s.min(v.minLength, `${f.label} must be at least ${v.minLength} characters.`);
      const base = f.type === "EMAIL" ? s.pipe(z.email(`${f.label} must be a valid email address.`)) : s;
      return f.required
        ? z.preprocess(emptyToUndefined, base.optional()).refine((x) => x !== undefined, req)
        : z.preprocess(emptyToUndefined, base.optional());
    }
    case "NUMBER": {
      let n = z.coerce
        .number({ error: `${f.label} must be a number.` })
        .refine(Number.isFinite, `${f.label} must be a number.`);
      if (v.min !== undefined) n = n.refine((x) => x >= v.min!, `${f.label} must be at least ${v.min}.`);
      if (v.max !== undefined) n = n.refine((x) => x <= v.max!, `${f.label} must be at most ${v.max}.`);
      const s = z.preprocess(emptyToUndefined, n.optional());
      return f.required ? s.refine((x) => x !== undefined, req) : s;
    }
    case "DATE": {
      const d = z
        .string()
        .regex(DATE_RE, `${f.label} must be a valid date.`)
        .refine((x) => !Number.isNaN(Date.parse(x)), `${f.label} must be a valid date.`);
      const s = z.preprocess(emptyToUndefined, d.optional());
      return f.required ? s.refine((x) => x !== undefined, req) : s;
    }
    case "SELECT":
    case "RADIO": {
      const one = z.string().refine((x) => opts.includes(x), `Choose a valid option for ${f.label}.`);
      const s = z.preprocess(emptyToUndefined, one.optional());
      return f.required ? s.refine((x) => x !== undefined, req) : s;
    }
    case "CHECKBOX": {
      if (opts.length === 0) {
        // Single consent-style checkbox.
        const b = z.preprocess((x) => x === true || x === "on" || x === "true", z.boolean());
        return f.required ? b.refine((x) => x === true, req) : b;
      }
      const many = z
        .array(z.string())
        .max(opts.length)
        .refine((xs) => xs.every((x) => opts.includes(x)), `Choose valid options for ${f.label}.`)
        .transform((xs) => Array.from(new Set(xs)));
      const s = z.preprocess((x) => (x === undefined || x === null ? [] : Array.isArray(x) ? x : [x]), many);
      return f.required ? s.refine((xs) => xs.length > 0, `Select at least one option for ${f.label}.`) : s;
    }
  }
}

/** Builds the validator for a whole form. Unknown keys are dropped. */
export function buildSubmissionSchema(fields: FieldDef[]) {
  return z.object(Object.fromEntries(fields.map((f) => [f.key, fieldSchema(f)])));
}

export type AnswerValue = string | number | boolean | string[] | undefined;

/** Human-readable answer for admin views (option values → labels). */
export function formatAnswer(field: Pick<FieldDef, "type" | "options">, value: unknown): string {
  const label = (v: string) => field.options?.find((o) => o.value === v)?.label ?? v;
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.map((v) => label(String(v))).join(", ") : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (field.type === "SELECT" || field.type === "RADIO") return label(String(value));
  return String(value);
}
