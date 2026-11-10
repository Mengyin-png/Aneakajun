import "server-only";
import type { CategoryType, ContentStatus, Prisma } from "@prisma/client";
import type { ArticleFormValues } from "@/components/admin/article-form";
import type { OrganizationFormValues } from "@/components/admin/organization-form";
import type { PersonFormValues } from "@/components/admin/person-form";
import { prisma } from "@/lib/db";

export const ADMIN_PAGE_SIZE = 20;
const STATUSES: ContentStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];
export const parseStatus = (v?: string) => STATUSES.find((s) => s === v);

type Opt = { value: string; label: string };
const s = (v: string | null | undefined) => v ?? "";
const n = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));
const enName = <T extends { locale: string }>(ts: T[], key: keyof T) =>
  String(ts.find((t) => t.locale === "en")?.[key] ?? "");

// ── Options for selects ────────────────────────────────────────────────────

export async function categoryIdOptions(type: CategoryType): Promise<Opt[]> {
  const rows = await prisma.category.findMany({ where: { type }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return rows.map((c) => ({ value: c.id, label: c.name }));
}

export async function locationIdOptions(): Promise<Opt[]> {
  const rows = await prisma.location.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const roots = rows.filter((r) => !r.parentId);
  return roots.flatMap((r) => [
    { value: r.id, label: r.name },
    ...rows.filter((c) => c.parentId === r.id).map((c) => ({ value: c.id, label: `— ${c.name}` })),
  ]);
}

export async function skillOptions(): Promise<Opt[]> {
  return (await prisma.skill.findMany({ orderBy: { name: "asc" } })).map((x) => ({ value: x.id, label: x.name }));
}

export async function tagIdOptions(): Promise<Opt[]> {
  return (await prisma.tag.findMany({ orderBy: { name: "asc" } })).map((x) => ({ value: x.id, label: x.name }));
}

/** All people/organizations (any status), labelled with their English name. */
export async function personOptions(): Promise<Opt[]> {
  const rows = await prisma.person.findMany({
    select: { id: true, status: true, translations: { where: { locale: "en" }, select: { name: true } } },
  });
  return rows
    .map((p) => ({
      value: p.id,
      label: `${p.translations[0]?.name ?? "(unnamed)"}${p.status === "PUBLISHED" ? "" : ` (${p.status.toLowerCase()})`}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function organizationOptions(): Promise<Opt[]> {
  const rows = await prisma.organization.findMany({
    select: { id: true, status: true, translations: { where: { locale: "en" }, select: { name: true } } },
  });
  return rows
    .map((o) => ({
      value: o.id,
      label: `${o.translations[0]?.name ?? "(unnamed)"}${o.status === "PUBLISHED" ? "" : ` (${o.status.toLowerCase()})`}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// ── Lists ──────────────────────────────────────────────────────────────────

export type AdminRow = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  status: ContentStatus;
  isFeatured: boolean;
  updatedAt: Date;
  createdBy: string | null;
};

type ListParams = { q?: string; status?: ContentStatus; page: number; mine?: string };

function paging(page: number) {
  return { skip: (Math.max(1, page) - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE };
}

export async function adminListPeople(p: ListParams) {
  const where: Prisma.PersonWhereInput = {
    ...(p.status ? { status: p.status } : {}),
    ...(p.mine ? { createdById: p.mine } : {}),
    ...(p.q
      ? {
          OR: [
            { slug: { contains: p.q, mode: "insensitive" } },
            { translations: { some: { name: { contains: p.q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.person.count({ where }),
    prisma.person.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { translations: { where: { locale: "en" } }, createdBy: { select: { name: true } } },
      ...paging(p.page),
    }),
  ]);
  const items: AdminRow[] = rows.map((r) => ({
    id: r.id,
    title: r.translations[0]?.name ?? r.slug,
    subtitle: r.translations[0]?.headline ?? null,
    slug: r.slug,
    status: r.status,
    isFeatured: r.isFeatured,
    updatedAt: r.updatedAt,
    createdBy: r.createdBy?.name ?? null,
  }));
  return { items, total };
}

export async function adminListOrganizations(p: ListParams) {
  const where: Prisma.OrganizationWhereInput = {
    ...(p.status ? { status: p.status } : {}),
    ...(p.mine ? { createdById: p.mine } : {}),
    ...(p.q
      ? {
          OR: [
            { slug: { contains: p.q, mode: "insensitive" } },
            { translations: { some: { name: { contains: p.q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.organization.count({ where }),
    prisma.organization.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { translations: { where: { locale: "en" } }, createdBy: { select: { name: true } } },
      ...paging(p.page),
    }),
  ]);
  const items: AdminRow[] = rows.map((r) => ({
    id: r.id,
    title: r.translations[0]?.name ?? r.slug,
    subtitle: r.translations[0]?.tagline ?? null,
    slug: r.slug,
    status: r.status,
    isFeatured: r.isFeatured,
    updatedAt: r.updatedAt,
    createdBy: r.createdBy?.name ?? null,
  }));
  return { items, total };
}

export async function adminListArticles(p: ListParams) {
  const where: Prisma.ArticleWhereInput = {
    ...(p.status ? { status: p.status } : {}),
    ...(p.mine ? { createdById: p.mine } : {}),
    ...(p.q
      ? {
          OR: [
            { slug: { contains: p.q, mode: "insensitive" } },
            { translations: { some: { title: { contains: p.q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { translations: { where: { locale: "en" } }, createdBy: { select: { name: true } }, category: true },
      ...paging(p.page),
    }),
  ]);
  const items: AdminRow[] = rows.map((r) => ({
    id: r.id,
    title: r.translations[0]?.title ?? r.slug,
    subtitle: r.category?.name ?? null,
    slug: r.slug,
    status: r.status,
    isFeatured: r.isFeatured,
    updatedAt: r.updatedAt,
    createdBy: r.createdBy?.name ?? null,
  }));
  return { items, total };
}

// ── Edit-form loaders ──────────────────────────────────────────────────────

const meta = (r: {
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  status: string;
  createdBy: { name: string } | null;
}) => ({
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  createdBy: r.createdBy?.name ?? null,
  slug: r.slug,
  status: r.status,
});

export async function loadPersonForm(id: string) {
  const p = await prisma.person.findUnique({
    where: { id },
    include: {
      translations: true,
      photo: true,
      skills: true,
      education: { orderBy: { sortOrder: "asc" } },
      experience: { orderBy: { sortOrder: "asc" } },
      createdBy: { select: { name: true } },
    },
  });
  if (!p) return null;
  const tr = (locale: "en" | "km") => {
    const t = p.translations.find((x) => x.locale === locale);
    return {
      name: s(t?.name),
      headline: s(t?.headline),
      bio: s(t?.bio),
      seoTitle: s(t?.seoTitle),
      seoDescription: s(t?.seoDescription),
    };
  };
  const values: PersonFormValues = {
    slug: p.slug,
    status: p.status,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    photo: p.photo ? { id: p.photo.id, url: p.photo.url } : null,
    locationId: s(p.locationId),
    industryId: s(p.industryId),
    categoryId: s(p.categoryId),
    websiteUrl: s(p.websiteUrl),
    linkedinUrl: s(p.linkedinUrl),
    facebookUrl: s(p.facebookUrl),
    xUrl: s(p.xUrl),
    email: s(p.email),
    translations: { en: tr("en"), km: tr("km") },
    skillIds: p.skills.map((x) => x.skillId),
    education: p.education.map((e) => ({
      institution: e.institution,
      degree: s(e.degree),
      field: s(e.field),
      startYear: n(e.startYear),
      endYear: n(e.endYear),
    })),
    experience: p.experience.map((e) => ({
      title: e.title,
      organizationName: e.organizationName,
      organizationId: s(e.organizationId),
      startYear: n(e.startYear),
      endYear: n(e.endYear),
      description: s(e.description),
    })),
  };
  return {
    values,
    record: { status: p.status, createdById: p.createdById },
    meta: meta(p),
    name: enName(p.translations, "name"),
  };
}

export async function loadOrganizationForm(id: string) {
  const o = await prisma.organization.findUnique({
    where: { id },
    include: {
      translations: true,
      logo: true,
      cover: true,
      members: { orderBy: { sortOrder: "asc" } },
      createdBy: { select: { name: true } },
    },
  });
  if (!o) return null;
  const tr = (locale: "en" | "km") => {
    const t = o.translations.find((x) => x.locale === locale);
    return {
      name: s(t?.name),
      tagline: s(t?.tagline),
      description: s(t?.description),
      mission: s(t?.mission),
      vision: s(t?.vision),
      activities: s(t?.activities),
      address: s(t?.address),
      seoTitle: s(t?.seoTitle),
      seoDescription: s(t?.seoDescription),
    };
  };
  const values: OrganizationFormValues = {
    slug: o.slug,
    status: o.status,
    isFeatured: o.isFeatured,
    sortOrder: o.sortOrder,
    logo: o.logo ? { id: o.logo.id, url: o.logo.url } : null,
    cover: o.cover ? { id: o.cover.id, url: o.cover.url } : null,
    locationId: s(o.locationId),
    industryId: s(o.industryId),
    categoryId: s(o.categoryId),
    foundedYear: n(o.foundedYear),
    websiteUrl: s(o.websiteUrl),
    email: s(o.email),
    phone: s(o.phone),
    facebookUrl: s(o.facebookUrl),
    linkedinUrl: s(o.linkedinUrl),
    translations: { en: tr("en"), km: tr("km") },
    members: o.members.map((m) => ({
      personId: m.personId,
      role: s(m.role),
      isKeyPerson: m.isKeyPerson,
      isCurrent: m.isCurrent,
    })),
  };
  return {
    values,
    record: { status: o.status, createdById: o.createdById },
    meta: meta(o),
    name: enName(o.translations, "name"),
  };
}

export async function loadArticleForm(id: string) {
  const a = await prisma.article.findUnique({
    where: { id },
    include: {
      translations: true,
      featuredImage: true,
      tags: true,
      people: true,
      organizations: true,
      createdBy: { select: { name: true } },
    },
  });
  if (!a) return null;
  const tr = (locale: "en" | "km") => {
    const t = a.translations.find((x) => x.locale === locale);
    return {
      title: s(t?.title),
      excerpt: s(t?.excerpt),
      body: s(t?.body),
      seoTitle: s(t?.seoTitle),
      seoDescription: s(t?.seoDescription),
    };
  };
  const values: ArticleFormValues = {
    slug: a.slug,
    status: a.status,
    isFeatured: a.isFeatured,
    sortOrder: a.sortOrder,
    featuredImage: a.featuredImage ? { id: a.featuredImage.id, url: a.featuredImage.url } : null,
    categoryId: s(a.categoryId),
    authorPersonId: s(a.authorPersonId),
    tagIds: a.tags.map((x) => x.tagId),
    personIds: a.people.map((x) => x.personId),
    organizationIds: a.organizations.map((x) => x.organizationId),
    translations: { en: tr("en"), km: tr("km") },
  };
  return {
    values,
    record: { status: a.status, createdById: a.createdById },
    meta: meta(a),
    name: enName(a.translations, "title"),
  };
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export async function dashboardStats() {
  const group = async (model: "person" | "organization" | "article") => {
    const rows =
      model === "person"
        ? await prisma.person.groupBy({ by: ["status"], _count: true })
        : model === "organization"
          ? await prisma.organization.groupBy({ by: ["status"], _count: true })
          : await prisma.article.groupBy({ by: ["status"], _count: true });
    const byStatus = Object.fromEntries(STATUSES.map((st) => [st, 0])) as Record<ContentStatus, number>;
    for (const r of rows) byStatus[r.status] = r._count;
    return { total: rows.reduce((a, r) => a + r._count, 0), byStatus };
  };
  const [people, organizations, articles, media, users] = await Promise.all([
    group("person"),
    group("organization"),
    group("article"),
    prisma.media.count(),
    prisma.user.count({ where: { isActive: true } }),
  ]);
  return { people, organizations, articles, media, users };
}
