import { describe, expect, it } from "vitest";
import { hashPassword, passwordPolicyError, verifyPassword } from "@/lib/auth/password";
import { PERMISSIONS, ROLE_DEFINITIONS } from "@/lib/auth/permissions";
import { isLocale, localePath } from "@/lib/i18n/config";
import { localizedName, pickTranslation } from "@/lib/i18n/localize";
import { sniffImageType } from "@/lib/media-validation";
import { plainText } from "@/lib/text";
import { slugify, SLUG_PATTERN, uniqueSlug } from "@/lib/slug";
import { cleanQuery, parsePage, parseSort, relevance, sortAndPage } from "@/server/queries/shared";

describe("slugs", () => {
  it("creates URL-safe slugs and falls back for Khmer-only text", () => {
    expect(slugify("Dr. Bopha Lim")).toBe("dr-bopha-lim");
    expect(slugify("  École Française d'Asie  ")).toBe("ecole-francaise-d-asie");
    expect(slugify("ចាន់ សុខា")).toMatch(/^item-[0-9a-f]{6}$/);
    expect(SLUG_PATTERN.test("sokha-chan")).toBe(true);
    expect(SLUG_PATTERN.test("Sokha_Chan")).toBe(false);
  });

  it("appends a counter until the slug is free", async () => {
    const taken = new Set(["mekong-solar", "mekong-solar-2"]);
    expect(await uniqueSlug("Mekong Solar", async (s) => taken.has(s))).toBe("mekong-solar-3");
  });
});

describe("passwords", () => {
  it("hashes with a random salt and verifies", async () => {
    const a = await hashPassword("correct horse 42");
    const b = await hashPassword("correct horse 42");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse 42", a)).toBe(true);
    expect(await verifyPassword("wrong", a)).toBe(false);
    expect(await verifyPassword("x", "garbage")).toBe(false);
  });

  it("enforces the password policy", () => {
    expect(passwordPolicyError("short1")).toMatch(/10 characters/);
    expect(passwordPolicyError("onlyletters")).toMatch(/letters and numbers/);
    expect(passwordPolicyError("letters1234")).toBeNull();
  });
});

describe("roles", () => {
  it("are ordered by privilege and only Super Admin manages users", () => {
    const { SUPER_ADMIN, ADMIN, EDITOR, CONTRIBUTOR } = ROLE_DEFINITIONS;
    expect(SUPER_ADMIN.permissions).toEqual(Object.keys(PERMISSIONS));
    expect(ADMIN.permissions).not.toContain("users.manage");
    expect(EDITOR.permissions).toContain("content.publish");
    expect(EDITOR.permissions).not.toContain("content.delete");
    expect(CONTRIBUTOR.permissions).not.toContain("content.publish");
    expect(CONTRIBUTOR.permissions).not.toContain("content.edit");
    expect(CONTRIBUTOR.permissions).toContain("content.editOwn");
    expect(SUPER_ADMIN.rank > ADMIN.rank && ADMIN.rank > EDITOR.rank && EDITOR.rank > CONTRIBUTOR.rank).toBe(true);
  });
});

describe("i18n helpers", () => {
  it("builds locale paths with English at the root", () => {
    expect(localePath("en", "/people")).toBe("/people");
    expect(localePath("km", "/people")).toBe("/km/people");
    expect(localePath("km", "/")).toBe("/km");
    expect(isLocale("km")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("falls back to English content", () => {
    const t = [
      { locale: "en", name: "Sokha" },
      { locale: "km", name: "សុខា" },
    ];
    expect(pickTranslation(t, "km")?.name).toBe("សុខា");
    expect(pickTranslation([t[0]], "km")?.name).toBe("Sokha");
    expect(localizedName({ name: "Kampot", nameKm: "កំពត" }, "km")).toBe("កំពត");
    expect(localizedName({ name: "Kampot", nameKm: null }, "km")).toBe("Kampot");
  });
});

describe("upload type detection", () => {
  it("trusts file bytes, not names", () => {
    expect(sniffImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d]))).toBe("image/png");
    expect(sniffImageType(new TextEncoder().encode("GIF89a"))).toBe("image/gif");
    expect(sniffImageType(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8"))).toBe("image/webp");
    expect(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode("<html>"))).toBeNull();
  });
});

describe("search helpers", () => {
  it("parses query parameters defensively", () => {
    expect(cleanQuery("  mekong   solar ")).toBe("mekong solar");
    expect(cleanQuery("x".repeat(500))).toHaveLength(100);
    expect(parsePage("3")).toBe(3);
    expect(parsePage("-1")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parseSort(undefined, true)).toBe("relevance");
    expect(parseSort(undefined, false)).toBe("newest");
    expect(parseSort("relevance", false)).toBe("newest");
  });

  it("ranks exact and prefix name matches above other matches", () => {
    const row = (names: string[], fields: string[] = []) => ({ id: names[0], date: null, names, fields });
    expect(relevance(row(["Riel Pay"]), "riel pay")).toBe(100);
    expect(relevance(row(["Riel Pay"]), "riel")).toBe(80);
    expect(relevance(row(["Mekong Solar"]), "solar")).toBe(70);
    expect(relevance(row(["Teaching code"], ["learn in khmer"]), "khmer")).toBe(30);
    expect(relevance(row(["ចាន់ សុខា"]), "សុខា")).toBe(70);
  });

  it("sorts and paginates", () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({
      id: `id${i}`,
      date: new Date(2026, 0, i + 1),
      names: [`Name ${String(i).padStart(2, "0")}`],
      fields: [],
    }));
    const newest = sortAndPage(rows, { sort: "newest", q: "", page: 1, locale: "en" });
    expect(newest.ids[0]).toBe("id29");
    expect(newest.pageCount).toBe(3);
    const alpha = sortAndPage(rows, { sort: "alpha", q: "", page: 3, locale: "en" });
    expect(alpha.ids).toEqual(["id24", "id25", "id26", "id27", "id28", "id29"]);
    expect(sortAndPage(rows, { sort: "newest", q: "", page: 99, locale: "en" }).page).toBe(3);
  });
});

describe("markdown", () => {
  it("produces plain-text descriptions", () => {
    expect(plainText("## Title\n\nSee [Riel Pay](/organizations/riel-pay) **now**.", 200)).toBe(
      "Title See Riel Pay now.",
    );
    expect(plainText("a ".repeat(200), 20)).toHaveLength(20);
  });
});
