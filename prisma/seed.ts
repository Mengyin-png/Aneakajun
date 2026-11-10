/**
 * Development seed. Safe to run repeatedly: every record is upserted by a
 * natural key (slug / email / role key), so nothing is duplicated.
 *
 *   npm run db:seed
 *
 * Refuses to run with NODE_ENV=production or against a non-local database
 * (override the latter only with SEED_ALLOW_REMOTE=1, never for production).
 */
import { PrismaClient, type Locale } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password.ts";
import { PERMISSIONS, ROLE_DEFINITIONS, type RoleKey } from "../src/lib/auth/permissions.ts";
import { ARTICLES, CATEGORIES, LOCATIONS, ORGANIZATIONS, PEOPLE, SKILLS, TAGS } from "./seed-data.ts";

function assertDevelopmentDatabase() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed: NODE_ENV=production.");
  const url = process.env.DATABASE_URL ?? "";
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  if (!["localhost", "127.0.0.1", "::1"].includes(host) && process.env.SEED_ALLOW_REMOTE !== "1") {
    throw new Error(
      `Refusing to seed non-local database host "${host}". Set SEED_ALLOW_REMOTE=1 to override (never in production).`,
    );
  }
}

const prisma = new PrismaClient();

export const DEV_USERS: { email: string; name: string; role: RoleKey }[] = [
  { email: "superadmin@example.com", name: "Super Admin (dev)", role: "SUPER_ADMIN" },
  { email: "admin@example.com", name: "Admin (dev)", role: "ADMIN" },
  { email: "editor@example.com", name: "Editor (dev)", role: "EDITOR" },
  { email: "contributor@example.com", name: "Contributor (dev)", role: "CONTRIBUTOR" },
];
const DEV_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Aneakajun-dev-2026";

async function seedAccessControl() {
  for (const [key, description] of Object.entries(PERMISSIONS)) {
    await prisma.permission.upsert({ where: { key }, create: { key, description }, update: { description } });
  }
  const permissions = await prisma.permission.findMany();
  const permId = new Map(permissions.map((p) => [p.key, p.id]));

  for (const [key, def] of Object.entries(ROLE_DEFINITIONS)) {
    const role = await prisma.role.upsert({
      where: { key },
      create: { key, name: def.name, description: def.description, rank: def.rank },
      update: { name: def.name, description: def.description, rank: def.rank },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: def.permissions.map((p) => ({ roleId: role.id, permissionId: permId.get(p)! })),
    });
  }

  const roles = new Map((await prisma.role.findMany()).map((r) => [r.key, r.id]));
  const passwordHash = await hashPassword(DEV_PASSWORD);
  for (const u of DEV_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: { email: u.email, name: u.name, roleId: roles.get(u.role)!, passwordHash },
      update: {
        name: u.name,
        roleId: roles.get(u.role)!,
        passwordHash,
        isActive: true,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
  }
}

async function seedTaxonomy() {
  for (const loc of LOCATIONS.filter((l) => !l.parent)) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      create: { slug: loc.slug, type: loc.type, name: loc.name, nameKm: loc.nameKm },
      update: { type: loc.type, name: loc.name, nameKm: loc.nameKm },
    });
  }
  const parents = new Map((await prisma.location.findMany()).map((l) => [l.slug, l.id]));
  for (const [i, loc] of LOCATIONS.filter((l) => l.parent).entries()) {
    const data = {
      type: loc.type,
      name: loc.name,
      nameKm: loc.nameKm,
      parentId: parents.get(loc.parent!)!,
      sortOrder: i,
    };
    await prisma.location.upsert({ where: { slug: loc.slug }, create: { slug: loc.slug, ...data }, update: data });
  }

  for (const [i, c] of CATEGORIES.entries()) {
    const data = { name: c.name, nameKm: c.nameKm, isFeatured: c.featured, sortOrder: i };
    await prisma.category.upsert({
      where: { type_slug: { type: c.type, slug: c.slug } },
      create: { type: c.type, slug: c.slug, ...data },
      update: data,
    });
  }
  for (const t of TAGS) {
    await prisma.tag.upsert({ where: { slug: t.slug }, create: t, update: { name: t.name, nameKm: t.nameKm } });
  }
  for (const s of SKILLS) {
    await prisma.skill.upsert({ where: { slug: s.slug }, create: s, update: { name: s.name, nameKm: s.nameKm } });
  }
}

type Lookups = {
  location: Map<string, string>;
  category: Map<string, string>; // key: `${type}:${slug}`
  skill: Map<string, string>;
  tag: Map<string, string>;
};

async function lookups(): Promise<Lookups> {
  const [locations, categories, skills, tags] = await Promise.all([
    prisma.location.findMany(),
    prisma.category.findMany(),
    prisma.skill.findMany(),
    prisma.tag.findMany(),
  ]);
  return {
    location: new Map(locations.map((l) => [l.slug, l.id])),
    category: new Map(categories.map((c) => [`${c.type}:${c.slug}`, c.id])),
    skill: new Map(skills.map((s) => [s.slug, s.id])),
    tag: new Map(tags.map((t) => [t.slug, t.id])),
  };
}

function translations<T extends object>(en: T, km?: T): [Locale, T][] {
  return km
    ? [
        ["en", en],
        ["km", km],
      ]
    : [["en", en]];
}

const day = (i: number) => new Date(Date.UTC(2026, 9, 31 - i)); // deterministic publish dates

async function seedPeople(l: Lookups, creatorId: string) {
  for (const [i, p] of PEOPLE.entries()) {
    const data = {
      status: p.status,
      isFeatured: p.featured,
      sortOrder: i,
      locationId: l.location.get(p.location) ?? null,
      industryId: l.category.get(`INDUSTRY:${p.industry}`) ?? null,
      categoryId: l.category.get(`PEOPLE:${p.category}`) ?? null,
      websiteUrl: p.websiteUrl ?? null,
      linkedinUrl: p.linkedinUrl ?? null,
      facebookUrl: p.facebookUrl ?? null,
      publishedAt: p.status === "PUBLISHED" ? day(i) : null,
    };
    const person = await prisma.person.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, createdById: creatorId, ...data },
      update: data,
    });
    for (const [locale, t] of translations(p.en, p.km)) {
      const fields = { name: t.name, headline: t.headline ?? null, bio: t.bio ?? null };
      await prisma.personTranslation.upsert({
        where: { personId_locale: { personId: person.id, locale } },
        create: { personId: person.id, locale, ...fields },
        update: fields,
      });
    }
    await prisma.personSkill.deleteMany({ where: { personId: person.id } });
    await prisma.personSkill.createMany({
      data: p.skills.map((s) => ({ personId: person.id, skillId: l.skill.get(s)! })),
    });
    await prisma.personEducation.deleteMany({ where: { personId: person.id } });
    await prisma.personEducation.createMany({
      data: p.education.map((e, sortOrder) => ({ personId: person.id, sortOrder, ...e })),
    });
  }
}

async function seedOrganizations(l: Lookups, creatorId: string) {
  for (const [i, o] of ORGANIZATIONS.entries()) {
    const data = {
      status: o.status,
      isFeatured: o.featured,
      sortOrder: i,
      locationId: l.location.get(o.location) ?? null,
      industryId: l.category.get(`INDUSTRY:${o.industry}`) ?? null,
      categoryId: l.category.get(`ORGANIZATION:${o.category}`) ?? null,
      foundedYear: o.foundedYear ?? null,
      websiteUrl: o.websiteUrl ?? null,
      email: o.email ?? null,
      phone: o.phone ?? null,
      facebookUrl: o.facebookUrl ?? null,
      publishedAt: o.status === "PUBLISHED" ? day(i + 2) : null,
    };
    const org = await prisma.organization.upsert({
      where: { slug: o.slug },
      create: { slug: o.slug, createdById: creatorId, ...data },
      update: data,
    });
    for (const [locale, t] of translations(o.en, o.km)) {
      const fields = {
        name: t.name,
        tagline: t.tagline ?? null,
        description: t.description ?? null,
        mission: t.mission ?? null,
        vision: t.vision ?? null,
        activities: t.activities ?? null,
        address: t.address ?? null,
      };
      await prisma.organizationTranslation.upsert({
        where: { organizationId_locale: { organizationId: org.id, locale } },
        create: { organizationId: org.id, locale, ...fields },
        update: fields,
      });
    }
  }

  // Memberships and experience links need both people and organizations to exist.
  const people = new Map(
    (await prisma.person.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]),
  );
  const orgs = new Map(
    (await prisma.organization.findMany({ select: { id: true, slug: true } })).map((o) => [o.slug, o.id]),
  );
  for (const o of ORGANIZATIONS) {
    for (const [sortOrder, m] of o.members.entries()) {
      const data = { role: m.role, isKeyPerson: m.key, isCurrent: true, sortOrder };
      await prisma.organizationMember.upsert({
        where: { organizationId_personId: { organizationId: orgs.get(o.slug)!, personId: people.get(m.person)! } },
        create: { organizationId: orgs.get(o.slug)!, personId: people.get(m.person)!, ...data },
        update: data,
      });
    }
  }
  for (const p of PEOPLE) {
    const personId = people.get(p.slug)!;
    await prisma.personExperience.deleteMany({ where: { personId } });
    await prisma.personExperience.createMany({
      data: p.experience.map(({ org, ...e }, sortOrder) => ({
        personId,
        sortOrder,
        ...e,
        organizationId: org ? (orgs.get(org) ?? null) : null,
      })),
    });
  }
}

async function seedArticles(l: Lookups, creatorId: string) {
  const people = new Map(
    (await prisma.person.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]),
  );
  const orgs = new Map(
    (await prisma.organization.findMany({ select: { id: true, slug: true } })).map((o) => [o.slug, o.id]),
  );

  for (const [i, a] of ARTICLES.entries()) {
    const data = {
      status: a.status,
      isFeatured: a.featured,
      sortOrder: i,
      categoryId: l.category.get(`ARTICLE:${a.category}`) ?? null,
      authorPersonId: a.author ? (people.get(a.author) ?? null) : null,
      publishedAt: a.status === "PUBLISHED" ? new Date(`${a.publishedAt}T08:00:00Z`) : null,
    };
    const article = await prisma.article.upsert({
      where: { slug: a.slug },
      create: { slug: a.slug, createdById: creatorId, ...data },
      update: data,
    });
    for (const [locale, t] of translations(a.en, a.km)) {
      const fields = { title: t.title, excerpt: t.excerpt ?? null, body: t.body };
      await prisma.articleTranslation.upsert({
        where: { articleId_locale: { articleId: article.id, locale } },
        create: { articleId: article.id, locale, ...fields },
        update: fields,
      });
    }
    await prisma.articleTag.deleteMany({ where: { articleId: article.id } });
    await prisma.articleTag.createMany({ data: a.tags.map((t) => ({ articleId: article.id, tagId: l.tag.get(t)! })) });
    await prisma.articlePerson.deleteMany({ where: { articleId: article.id } });
    await prisma.articlePerson.createMany({
      data: a.people.map((p) => ({ articleId: article.id, personId: people.get(p)! })),
    });
    await prisma.articleOrganization.deleteMany({ where: { articleId: article.id } });
    await prisma.articleOrganization.createMany({
      data: a.orgs.map((o) => ({ articleId: article.id, organizationId: orgs.get(o)! })),
    });
  }
}

async function seedSettings() {
  const data = {
    siteName: "Aneakajun",
    siteNameKm: null, // official Khmer spelling of the brand to be provided by the client
    tagline: "Cambodian People & Organization Information Hub",
    taglineKm: "មជ្ឈមណ្ឌលព័ត៌មានអំពីប្រជាជន និងអង្គការកម្ពុជា",
    description: "Discover Cambodian people, organizations, knowledge and opportunities — at home and abroad.",
    descriptionKm: "ស្វែងយល់អំពីប្រជាជន អង្គការ ចំណេះដឹង និងឱកាសរបស់កម្ពុជា ទាំងក្នុងនិងក្រៅប្រទេស។",
    contactEmail: "hello@example.com",
    address: "Phnom Penh, Cambodia",
    addressKm: "រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា",
    facebookUrl: "https://www.facebook.com/example",
    telegramUrl: "https://t.me/example",
    footerNote: "Development data — all people and organizations are fictional.",
    footerNoteKm: "ទិន្នន័យសាកល្បង — បុគ្គល និងអង្គការទាំងអស់ជាការប្រឌិត។",
  };
  await prisma.siteSettings.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
}

async function main() {
  assertDevelopmentDatabase();
  await seedAccessControl();
  await seedTaxonomy();
  const l = await lookups();
  const creator = await prisma.user.findUniqueOrThrow({ where: { email: "editor@example.com" } });
  await seedPeople(l, creator.id);
  await seedOrganizations(l, creator.id);
  await seedArticles(l, creator.id);
  await seedSettings();

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.person.count(),
    prisma.organization.count(),
    prisma.article.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.skill.count(),
    prisma.location.count(),
  ]);
  console.log(
    `Seeded: ${counts[0]} users, ${counts[1]} people, ${counts[2]} organizations, ${counts[3]} articles, ` +
      `${counts[4]} categories, ${counts[5]} tags, ${counts[6]} skills, ${counts[7]} locations.`,
  );
  console.log(`Dev accounts: ${DEV_USERS.map((u) => u.email).join(", ")} — password in docs/DEVELOPMENT.md`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
