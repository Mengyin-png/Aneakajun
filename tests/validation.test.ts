import { describe, expect, it } from "vitest";
import { createUserSchema, settingsSchema, taxonomySchema } from "@/lib/validation/admin";
import { articleSchema, organizationSchema, personSchema, zodErrors } from "@/lib/validation/content";

const tr = { name: "", headline: "", bio: "", seoTitle: "", seoDescription: "" };
const person = (over: Record<string, unknown> = {}) => ({
  slug: "",
  status: "DRAFT",
  isFeatured: false,
  sortOrder: "0",
  photoId: null,
  locationId: "",
  industryId: "",
  categoryId: "",
  websiteUrl: "",
  linkedinUrl: "",
  facebookUrl: "",
  xUrl: "",
  email: "",
  translations: { en: { ...tr, name: "Sokha Chan" }, km: { ...tr } },
  skillIds: ["a", "a", "b"],
  education: [],
  experience: [],
  ...over,
});

describe("personSchema", () => {
  it("normalises a minimal valid person", () => {
    const r = personSchema.safeParse(person());
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.translations.km.name).toBeNull();
      expect(r.data.websiteUrl).toBeNull();
      expect(r.data.locationId).toBeNull();
      expect(r.data.skillIds).toEqual(["a", "b"]);
      expect(r.data.sortOrder).toBe(0);
    }
  });

  it("requires an English name and reports nested errors by path", () => {
    const r = personSchema.safeParse(
      person({
        translations: { en: { ...tr }, km: { ...tr } },
        websiteUrl: "javascript:alert(1)",
        slug: "Bad Slug!",
        experience: [
          { title: "", organizationName: "X", organizationId: "", startYear: "1800", endYear: "", description: "" },
        ],
      }),
    );
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodErrors(r.error);
      expect(e["translations.en.name"]).toMatch(/required/);
      expect(e.websiteUrl).toMatch(/https/);
      expect(e.slug).toMatch(/lowercase/);
      expect(e["experience.0.title"]).toMatch(/required/);
      expect(e["experience.0.startYear"]).toMatch(/early/);
    }
  });

  it("rejects unknown statuses", () => {
    expect(personSchema.safeParse(person({ status: "LIVE" })).success).toBe(false);
  });
});

describe("organizationSchema", () => {
  const otr = {
    name: "",
    tagline: "",
    description: "",
    mission: "",
    vision: "",
    activities: "",
    address: "",
    seoTitle: "",
    seoDescription: "",
  };
  const org = (members: unknown[]) => ({
    slug: "",
    status: "PUBLISHED",
    isFeatured: true,
    sortOrder: 1,
    logoId: "",
    coverId: "",
    locationId: "",
    industryId: "",
    categoryId: "",
    foundedYear: "2016",
    websiteUrl: "https://example.com",
    email: "a@b.co",
    phone: "",
    facebookUrl: "",
    linkedinUrl: "",
    translations: { en: { ...otr, name: "Mekong Solar" }, km: { ...otr, name: "មេគង្គសូឡា" } },
    members,
  });

  it("accepts members and Khmer content", () => {
    const r = organizationSchema.safeParse(org([{ personId: "p1", role: "CEO", isKeyPerson: true, isCurrent: true }]));
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.foundedYear).toBe(2016);
  });

  it("rejects duplicate members", () => {
    const m = { personId: "p1", role: "", isKeyPerson: false, isCurrent: true };
    expect(organizationSchema.safeParse(org([m, m])).success).toBe(false);
  });
});

describe("articleSchema", () => {
  const atr = { title: "", excerpt: "", body: "", seoTitle: "", seoDescription: "" };
  const article = (km: Partial<typeof atr>) => ({
    slug: "",
    status: "DRAFT",
    isFeatured: false,
    sortOrder: 0,
    categoryId: "",
    authorPersonId: "",
    featuredImageId: null,
    tagIds: [],
    personIds: [],
    organizationIds: [],
    translations: { en: { ...atr, title: "Hello", body: "Body" }, km: { ...atr, ...km } },
  });

  it("requires Khmer title and body together", () => {
    expect(articleSchema.safeParse(article({})).success).toBe(true);
    expect(articleSchema.safeParse(article({ title: "សួស្តី", body: "អត្ថបទ" })).success).toBe(true);
    const r = articleSchema.safeParse(article({ title: "សួស្តី" }));
    expect(r.success).toBe(false);
    if (!r.success) expect(zodErrors(r.error)["translations.km.body"]).toMatch(/both/);
  });

  it("requires an English body", () => {
    const r = articleSchema.safeParse({ ...article({}), translations: { en: { ...atr, title: "T" }, km: atr } });
    expect(r.success).toBe(false);
  });
});

describe("admin schemas", () => {
  it("validates users, taxonomy and settings", () => {
    expect(
      createUserSchema.safeParse({ email: " Editor@Example.com ", name: "Ed", roleId: "r1", password: "letters1234" })
        .success,
    ).toBe(true);
    expect(createUserSchema.safeParse({ email: "x", name: "", roleId: "", password: "short" }).success).toBe(false);
    expect(taxonomySchema.safeParse({ name: "Health", nameKm: "សុខភាព", slug: "" }).success).toBe(true);
    expect(taxonomySchema.safeParse({ name: "", slug: "" }).success).toBe(false);
    expect(settingsSchema.safeParse({ siteName: "Aneakajun", facebookUrl: "facebook.com/x" }).success).toBe(false);
  });
});

describe("regressions", () => {
  it("taxonomy without a type (tags/skills) accepts an empty type value", () => {
    expect(
      taxonomySchema.safeParse({
        name: "Climate",
        nameKm: "",
        slug: "",
        type: "",
        parentId: "",
        isFeatured: false,
        sortOrder: "0",
      }).success,
    ).toBe(true);
  });
});
