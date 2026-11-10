import { z } from "zod";
import { passwordPolicyError } from "@/lib/auth/password";
import { optEmail, optText, optUrl, reqText, slugField, sortOrder } from "./content";

export const taxonomyKinds = ["categories", "tags", "skills", "locations"] as const;
export type TaxonomyKind = (typeof taxonomyKinds)[number];

export const taxonomySchema = z.object({
  id: z.string().max(64).optional(),
  name: reqText(100, "Name"),
  nameKm: optText(100, "Khmer name"),
  slug: slugField,
  type: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["INDUSTRY", "PEOPLE", "ORGANIZATION", "ARTICLE", "COUNTRY", "PROVINCE", "CITY"]).optional(),
  ),
  parentId: z.preprocess((v) => (v === "" ? null : v), z.string().max(64).nullable().optional()),
  isFeatured: z.boolean().optional(),
  sortOrder: sortOrder.optional(),
});
export type TaxonomyInput = z.input<typeof taxonomySchema>;

const password = z
  .string()
  .max(200)
  .superRefine((v, ctx) => {
    const err = passwordPolicyError(v);
    if (err) ctx.addIssue({ code: "custom", message: err });
  });

export const createUserSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.email("Enter a valid email address."),
  ),
  name: reqText(100, "Name"),
  roleId: z.string().min(1, "Choose a role."),
  password,
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: reqText(100, "Name"),
  roleId: z.string().min(1, "Choose a role."),
  isActive: z.boolean(),
  newPassword: z.preprocess((v) => (v === "" ? undefined : v), password.optional()),
});

export const settingsSchema = z.object({
  siteName: reqText(80, "Site name"),
  siteNameKm: optText(80, "Khmer site name"),
  tagline: optText(160, "Tagline"),
  taglineKm: optText(160, "Khmer tagline"),
  description: optText(300, "Description"),
  descriptionKm: optText(300, "Khmer description"),
  contactEmail: optEmail,
  contactPhone: optText(40, "Phone"),
  address: optText(300, "Address"),
  addressKm: optText(300, "Khmer address"),
  facebookUrl: optUrl,
  telegramUrl: optUrl,
  youtubeUrl: optUrl,
  linkedinUrl: optUrl,
  footerNote: optText(300, "Footer note"),
  footerNoteKm: optText(300, "Khmer footer note"),
});
export type SettingsInput = z.input<typeof settingsSchema>;

export const loginSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.email("Enter a valid email address."),
  ),
  password: z.string().min(1, "Enter your password.").max(200),
});
