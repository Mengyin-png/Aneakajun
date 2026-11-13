import { z } from "zod";
import { FIELD_TYPES, optionsSchema, validationSchema } from "@/lib/forms/schema";

const opt = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => s || null)
    .nullable()
    .optional()
    .transform((s) => s ?? null);
const req = (max: number, msg = "Required.") => z.string().trim().min(1, msg).max(max);
const id = z
  .string()
  .trim()
  .max(40)
  .nullable()
  .optional()
  .transform((s) => s || null);
const safeUrl = z
  .string()
  .trim()
  .max(500)
  .refine((u) => /^https?:\/\/[^\s]+$/i.test(u), "Use a full http(s):// address.");

/** Reserved second-level paths under /<journey>/… */
export const RESERVED_GUIDANCE_SLUGS = ["form", "new"];
const slug = z
  .string()
  .trim()
  .max(120)
  .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, "Use lowercase letters, numbers and hyphens.")
  .refine((s) => !RESERVED_GUIDANCE_SLUGS.includes(s), "This slug is reserved.");

export const homepageSchema = z.object({
  heroPrefix: req(60),
  heroPrefixKm: opt(60),
  heroSuffix: req(60),
  heroSuffixKm: opt(60),
  heroSubtitle: opt(300),
  heroSubtitleKm: opt(300),
  ctaLabel: req(40),
  ctaLabelKm: opt(40),
  heroVideoId: id,
  heroImageId: id,
  sections: z
    .array(
      z.object({
        key: z.enum(["journeys", "guidance", "directory", "articles", "resources", "cta"]),
        enabled: z.boolean(),
      }),
    )
    .max(6),
  resources: z
    .array(
      z.object({
        title: req(120),
        titleKm: opt(120),
        url: safeUrl,
        description: opt(300),
        descriptionKm: opt(300),
      }),
    )
    .max(24),
});

export const JOURNEY_ICONS = [
  "home",
  "compass",
  "briefcase",
  "building",
  "location",
  "person",
  "grid",
  "tourism",
  "finance",
  "education",
];

export const journeySchema = z.object({
  title: req(80),
  titleKm: opt(80),
  verb: req(40),
  verbKm: opt(40),
  description: opt(400),
  descriptionKm: opt(400),
  icon: z.enum(JOURNEY_ICONS as [string, ...string[]]),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i, "Use a hex colour like #09786a."),
  coverId: id,
  videoId: id,
  isEnabled: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export const guidanceSchema = z.object({
  journeyId: req(40, "Choose a journey."),
  slug,
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  coverId: id,
  videoId: id,
  /** yyyy-mm-dd or empty. Only editors who can publish may set it. */
  lastReviewedAt: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use a valid date.")
    .transform((s) => s || null),
  translations: z.object({
    en: z.object({
      title: req(200, "Title is required."),
      summary: opt(600),
      nextSteps: opt(4000),
      seoTitle: opt(70),
      seoDescription: opt(170),
    }),
    km: z.object({
      title: opt(200),
      summary: opt(600),
      nextSteps: opt(4000),
      seoTitle: opt(70),
      seoDescription: opt(170),
    }),
  }),
  sections: z
    .array(
      z.object({
        kind: z.enum(["CONTENT", "NOTE", "WARNING"]),
        heading: req(200, "Section heading is required."),
        headingKm: opt(200),
        body: req(20000, "Section text is required."),
        bodyKm: opt(20000),
        imageId: id,
      }),
    )
    .min(1, "Add at least one section.")
    .max(40),
  references: z
    .array(
      z.object({
        title: req(200, "Reference title is required."),
        titleKm: opt(200),
        url: safeUrl,
        publisher: opt(120),
      }),
    )
    .max(40),
});
export type GuidanceInput = z.input<typeof guidanceSchema>;

export const formFieldSchema = z.object({
  id: id,
  key: z
    .string()
    .trim()
    .min(1, "Key is required.")
    .max(60)
    .regex(/^[a-z][a-z0-9_]*$/, "Lowercase letters, numbers and _ ; start with a letter."),
  type: z.enum(FIELD_TYPES),
  label: req(200, "Label is required."),
  labelKm: opt(200),
  helpText: opt(400),
  helpTextKm: opt(400),
  placeholder: opt(200),
  required: z.boolean(),
  options: optionsSchema,
  validation: validationSchema,
});

export const journeyFormSchema = z
  .object({
    journeyId: id,
    title: req(200),
    titleKm: opt(200),
    description: opt(1000),
    descriptionKm: opt(1000),
    submitLabel: opt(60),
    submitLabelKm: opt(60),
    isActive: z.boolean(),
    fields: z.array(formFieldSchema).max(60),
  })
  .superRefine((f, ctx) => {
    const seen = new Set<string>();
    f.fields.forEach((field, i) => {
      if (seen.has(field.key))
        ctx.addIssue({ code: "custom", path: ["fields", i, "key"], message: "Keys must be unique." });
      seen.add(field.key);
      if ((field.type === "SELECT" || field.type === "RADIO") && field.options.length === 0)
        ctx.addIssue({ code: "custom", path: ["fields", i, "options"], message: "Add at least one option." });
    });
  });
export type JourneyFormInput = z.input<typeof journeyFormSchema>;

export const reviewSchema = z.object({
  status: z.enum(["PENDING", "IN_REVIEW", "APPROVED", "REJECTED"]),
  internalNotes: opt(5000),
  note: opt(500),
});
