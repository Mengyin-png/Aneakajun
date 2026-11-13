import { describe, expect, it } from "vitest";
import { buildSubmissionSchema, formatAnswer, parseOptions, type FieldDef } from "@/lib/forms/schema";
import { blocksOf, buildPreview, measure, plainBlock } from "@/lib/guidance/preview";

const words = (n: number, w = "word") => Array.from({ length: n }, (_, i) => `${w}${i}`).join(" ");
const sections = [
  { id: "a", heading: "Intro", kind: "CONTENT", body: `${words(30, "alpha")}\n\n${words(30, "beta")}` },
  { id: "b", heading: "Middle", kind: "CONTENT", body: `**Bold** ${words(40, "gamma")}\n\n- ${words(10, "item")}` },
  { id: "c", heading: "Secret", kind: "WARNING", body: words(50, "secret") },
  { id: "d", heading: "End", kind: "NOTE", body: words(20, "omega") },
];

describe("guidance 40% preview", () => {
  it("returns everything for signed-in readers", () => {
    const p = buildPreview(sections, true);
    expect(p.locked).toBe(false);
    expect(p.visible).toHaveLength(4);
    expect(p.shownChars).toBe(p.totalChars);
  });

  it("guests get at most 40% of characters, within one word of the boundary", () => {
    const p = buildPreview(sections, false);
    const budget = Math.floor(p.totalChars * 0.4);
    expect(p.locked).toBe(true);
    expect(p.shownChars).toBeLessThanOrEqual(budget);
    expect(p.shownChars).toBeGreaterThan(budget - 12); // longest word here is ~10 chars
    const visibleText = p.visible.map((s) => blocksOf(s.body).map(plainBlock).join("") + (s.cutText ?? "")).join("");
    expect(visibleText.length).toBe(p.shownChars);
  });

  it("never includes locked text, only locked headings", () => {
    const p = buildPreview(sections, false);
    const serialized = JSON.stringify(p);
    expect(serialized).not.toContain("secret0");
    expect(serialized).not.toContain("omega");
    expect(p.lockedHeadings.map((h) => h.heading)).toEqual(expect.arrayContaining(["Secret", "End"]));
  });

  it("measures plain text, not Markdown syntax", () => {
    expect(plainBlock("**Bold** [link](https://x.y) - *it*")).toBe("Bold link - it");
    expect(measure([{ body: "## Hi\n\n**ab**" }])).toBe(4);
  });

  it("handles empty articles", () => {
    expect(buildPreview([], false)).toMatchObject({ locked: false, visible: [], totalChars: 0 });
  });
});

describe("dynamic form validation", () => {
  const fields: FieldDef[] = [
    { key: "name", type: "TEXT", label: "Name", required: true, validation: { maxLength: 10 } },
    { key: "email", type: "EMAIL", label: "Email", required: true },
    { key: "days", type: "NUMBER", label: "Days", required: true, validation: { min: 1, max: 30 } },
    { key: "arrive", type: "DATE", label: "Arrival", required: false },
    {
      key: "purpose",
      type: "SELECT",
      label: "Purpose",
      required: true,
      options: [
        { value: "work", label: "Work" },
        { value: "fun", label: "Fun" },
      ],
    },
    {
      key: "places",
      type: "CHECKBOX",
      label: "Places",
      required: true,
      options: [
        { value: "pp", label: "Phnom Penh" },
        { value: "sr", label: "Siem Reap" },
      ],
    },
    { key: "consent", type: "CHECKBOX", label: "Consent", required: true },
    { key: "how", type: "RADIO", label: "How", required: false, options: [{ value: "a", label: "A" }] },
  ];
  const schema = buildSubmissionSchema(fields);

  it("accepts and normalises valid answers, dropping unknown keys", () => {
    const r = schema.safeParse({
      name: " Dara ",
      email: "d@example.com",
      days: "7",
      arrive: "",
      purpose: "work",
      places: ["pp", "pp"],
      consent: "on",
      hack: "x",
    });
    expect(r.success).toBe(true);
    if (r.success)
      expect(r.data).toEqual({
        name: "Dara",
        email: "d@example.com",
        days: 7,
        arrive: undefined,
        purpose: "work",
        places: ["pp"],
        consent: true,
        how: undefined,
      });
  });

  it("rejects missing required fields, bad formats, out-of-range values and unknown options", () => {
    const r = schema.safeParse({
      name: "x".repeat(11),
      email: "nope",
      days: "99",
      arrive: "2026-13-45",
      purpose: "evil",
      places: ["xx"],
      consent: false,
      how: "z",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const keys = new Set(r.error.issues.map((i) => i.path[0]));
      for (const k of ["name", "email", "days", "arrive", "purpose", "places", "consent", "how"])
        expect(keys.has(k)).toBe(true);
    }
    const empty = schema.safeParse({});
    expect(empty.success).toBe(false);
  });

  it("formats answers for reviewers and ignores malformed option config", () => {
    expect(formatAnswer(fields[5], ["pp", "sr"])).toBe("Phnom Penh, Siem Reap");
    expect(formatAnswer(fields[4], "work")).toBe("Work");
    expect(formatAnswer(fields[6], true)).toBe("Yes");
    expect(parseOptions([{ value: "bad value!", label: "x" }])).toEqual([]);
  });
});

import { safeNext, signInPath } from "@/lib/auth/google";
import { guidanceSchema, journeyFormSchema } from "@/lib/validation/journeys";

describe("sign-in return paths", () => {
  it("only allows same-site relative paths", () => {
    expect(safeNext("/visit/tourist-visas-and-entry#continue")).toBe("/visit/tourist-visas-and-entry#continue");
    for (const bad of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "",
      null,
      "/admin/users",
      "/auth/google/start",
    ])
      expect(safeNext(bad)).toBe("/");
  });
  it("returns Khmer sign-in for Khmer pages", () => {
    expect(signInPath("/km/live")).toBe("/km/signin");
    expect(signInPath("/km")).toBe("/km/signin");
    expect(signInPath("/kmx")).toBe("/signin");
    expect(signInPath("/live")).toBe("/signin");
  });
});

describe("CMS validation", () => {
  const guide = {
    journeyId: "j1",
    slug: "",
    status: "DRAFT",
    isFeatured: false,
    sortOrder: 0,
    lastReviewedAt: "",
    translations: { en: { title: "T" }, km: {} },
    sections: [{ kind: "CONTENT", heading: "H", body: "B" }],
    references: [{ title: "Gov", url: "https://www.evisa.gov.kh" }],
  };
  it("accepts a valid guide and rejects unsafe reference URLs and reserved slugs", () => {
    expect(guidanceSchema.safeParse(guide).success).toBe(true);
    expect(
      guidanceSchema.safeParse({ ...guide, references: [{ title: "x", url: "javascript:alert(1)" }] }).success,
    ).toBe(false);
    expect(guidanceSchema.safeParse({ ...guide, slug: "form" }).success).toBe(false);
    expect(guidanceSchema.safeParse({ ...guide, sections: [] }).success).toBe(false);
  });
  it("rejects duplicate field keys and choice fields without options", () => {
    const field = { key: "a", type: "TEXT", label: "A", required: false, options: [], validation: {} };
    const base = { title: "F", isActive: true, fields: [field] };
    expect(journeyFormSchema.safeParse(base).success).toBe(true);
    expect(journeyFormSchema.safeParse({ ...base, fields: [field, field] }).success).toBe(false);
    expect(journeyFormSchema.safeParse({ ...base, fields: [{ ...field, type: "SELECT" }] }).success).toBe(false);
  });
});

describe("stored options", () => {
  it("keeps valid options when one entry is invalid", () => {
    expect(
      parseOptions([
        { value: "ok", label: "OK" },
        { value: "bad+", label: "Bad" },
      ]).map((o) => o.value),
    ).toEqual(["ok"]);
    expect(parseOptions("nope")).toEqual([]);
  });
});
