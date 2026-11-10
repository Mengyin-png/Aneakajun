import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";

// ── Field helpers ──────────────────────────────────────────────────────────

const text = (max: number, label = "This field") =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().max(max, `${label} must be ${max} characters or fewer.`),
  );

/** Optional text: empty string → null. */
export const optText = (max: number, label?: string) =>
  z
    .preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), text(max, label).nullable().optional())
    .transform((v) => v ?? null);

export const reqText = (max: number, label: string) =>
  text(max, label).pipe(z.string().min(1, `${label} is required.`));

const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export const optUrl = z
  .preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v),
    z.string().max(2048).refine(isHttpUrl, "Enter a full URL starting with https://").nullable().optional(),
  )
  .transform((v) => v ?? null);

export const optEmail = z
  .preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v),
    z.email("Enter a valid email address.").nullable().optional(),
  )
  .transform((v) => v ?? null);

export const optId = z
  .preprocess((v) => (v === "" ? null : v), z.string().min(1).max(64).nullable().optional())
  .transform((v) => v ?? null);

export const optYear = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().int("Enter a whole year.").min(1900, "Year looks too early.").max(2100, "Year looks too late.").nullable(),
);

export const sortOrder = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
  z.number().int("Display order must be a whole number.").min(-9999).max(9999),
);

export const slugField = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z
    .string()
    .max(80, "Slug must be 80 characters or fewer.")
    .refine((v) => v === "" || SLUG_PATTERN.test(v), {
      message: "Use lowercase letters, numbers and single hyphens (e.g. sokha-chan).",
    }),
);

export const statusField = z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]);
export const idList = z
  .array(z.string().min(1).max(64))
  .max(200)
  .transform((ids) => Array.from(new Set(ids)));

const seo = { seoTitle: optText(70, "SEO title"), seoDescription: optText(160, "SEO description") };

/**
 * Bilingual block: English is required (the fallback for every page);
 * Khmer is optional — leave its name/title blank to have no Khmer version.
 */
function bilingual<En extends z.ZodRawShape, Km extends z.ZodRawShape>(en: En, km: Km) {
  return z.object({ en: z.object(en), km: z.object(km) });
}

// ── Person ─────────────────────────────────────────────────────────────────

export const personSchema = z.object({
  slug: slugField,
  status: statusField,
  isFeatured: z.boolean(),
  sortOrder,
  photoId: optId,
  locationId: optId,
  industryId: optId,
  categoryId: optId,
  websiteUrl: optUrl,
  linkedinUrl: optUrl,
  facebookUrl: optUrl,
  xUrl: optUrl,
  email: optEmail,
  translations: bilingual(
    { name: reqText(120, "Name"), headline: optText(160, "Headline"), bio: optText(10000, "Biography"), ...seo },
    { name: optText(120, "Name"), headline: optText(160, "Headline"), bio: optText(10000, "Biography"), ...seo },
  ),
  skillIds: idList,
  education: z
    .array(
      z.object({
        institution: reqText(160, "Institution"),
        degree: optText(80, "Degree"),
        field: optText(120, "Field"),
        startYear: optYear,
        endYear: optYear,
      }),
    )
    .max(30),
  experience: z
    .array(
      z.object({
        title: reqText(120, "Title"),
        organizationName: reqText(160, "Organization"),
        organizationId: optId,
        startYear: optYear,
        endYear: optYear,
        description: optText(1000, "Description"),
      }),
    )
    .max(40),
});
export type PersonInput = z.input<typeof personSchema>;
export type PersonData = z.output<typeof personSchema>;

// ── Organization ───────────────────────────────────────────────────────────

const orgText = {
  tagline: optText(160, "Tagline"),
  description: optText(10000, "Description"),
  mission: optText(1000, "Mission"),
  vision: optText(1000, "Vision"),
  activities: optText(3000, "Activities"),
  address: optText(300, "Address"),
  ...seo,
};

export const organizationSchema = z.object({
  slug: slugField,
  status: statusField,
  isFeatured: z.boolean(),
  sortOrder,
  logoId: optId,
  coverId: optId,
  locationId: optId,
  industryId: optId,
  categoryId: optId,
  foundedYear: optYear,
  websiteUrl: optUrl,
  email: optEmail,
  phone: optText(40, "Phone"),
  facebookUrl: optUrl,
  linkedinUrl: optUrl,
  translations: bilingual({ name: reqText(160, "Name"), ...orgText }, { name: optText(160, "Name"), ...orgText }),
  members: z
    .array(
      z.object({
        personId: z.string().min(1, "Choose a person.").max(64),
        role: optText(120, "Role"),
        isKeyPerson: z.boolean(),
        isCurrent: z.boolean(),
      }),
    )
    .max(200)
    .refine((m) => new Set(m.map((x) => x.personId)).size === m.length, "Each person can only be listed once."),
});
export type OrganizationInput = z.input<typeof organizationSchema>;
export type OrganizationData = z.output<typeof organizationSchema>;

// ── Article ────────────────────────────────────────────────────────────────

export const articleSchema = z
  .object({
    slug: slugField,
    status: statusField,
    isFeatured: z.boolean(),
    sortOrder,
    categoryId: optId,
    authorPersonId: optId,
    featuredImageId: optId,
    tagIds: idList,
    personIds: idList,
    organizationIds: idList,
    translations: bilingual(
      { title: reqText(200, "Title"), excerpt: optText(400, "Excerpt"), body: reqText(100000, "Body"), ...seo },
      { title: optText(200, "Title"), excerpt: optText(400, "Excerpt"), body: optText(100000, "Body"), ...seo },
    ),
  })
  .superRefine((a, ctx) => {
    const km = a.translations.km;
    if ((km.title && !km.body) || (!km.title && km.body)) {
      ctx.addIssue({
        code: "custom",
        path: km.title ? ["translations", "km", "body"] : ["translations", "km", "title"],
        message: "Khmer title and body must both be filled in (or both left empty).",
      });
    }
  });
export type ArticleInput = z.input<typeof articleSchema>;
export type ArticleData = z.output<typeof articleSchema>;

// ── Helpers ────────────────────────────────────────────────────────────────

export type FieldErrors = Record<string, string>;

export function zodErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    out[key] ??= issue.message;
  }
  return out;
}

export type ActionResult<T = undefined> =
  | ({ ok: true; message?: string } & (T extends undefined ? object : { data: T }))
  | { ok: false; message: string; errors?: FieldErrors };
