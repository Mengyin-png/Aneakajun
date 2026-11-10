import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-table";
import { TaxonomyManager, type TaxonomyRow } from "@/components/admin/taxonomy-manager";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { taxonomyKinds, type TaxonomyKind } from "@/lib/validation/admin";

const TITLES: Record<TaxonomyKind, { title: string; description: string }> = {
  categories: {
    title: "Categories",
    description: "Industries (people & organizations), people categories, organization types and article categories.",
  },
  tags: { title: "Tags", description: "Keywords for articles." },
  skills: { title: "Skills", description: "Expertise shown on people profiles and used in search." },
  locations: {
    title: "Locations",
    description: "Countries, provinces and cities. Filtering by a country includes its provinces and cities.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  return { title: TITLES[kind as TaxonomyKind]?.title ?? "Taxonomy" };
}

async function loadRows(kind: TaxonomyKind): Promise<TaxonomyRow[]> {
  if (kind === "categories") {
    const rows = await prisma.category.findMany({
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            peopleInCategory: true,
            peopleInIndustry: true,
            orgsInCategory: true,
            orgsInIndustry: true,
            articles: true,
          },
        },
      },
    });
    return rows.map((r) => ({ ...r, usage: Object.values(r._count).reduce((a, b) => a + b, 0) }));
  }
  if (kind === "locations") {
    const rows = await prisma.location.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        parent: { select: { name: true } },
        _count: { select: { people: true, organizations: true, children: true } },
      },
    });
    return rows.map((r) => ({
      ...r,
      parentName: r.parent?.name ?? null,
      usage: r._count.people + r._count.organizations,
    }));
  }
  if (kind === "tags") {
    const rows = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });
    return rows.map((r) => ({ ...r, usage: r._count.articles }));
  }
  const rows = await prisma.skill.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { people: true } } },
  });
  return rows.map((r) => ({ ...r, usage: r._count.people }));
}

export default async function TaxonomyPage({ params }: { params: Promise<{ kind: string }> }) {
  await requireUser("taxonomy.manage");
  const { kind: raw } = await params;
  if (!taxonomyKinds.includes(raw as TaxonomyKind)) notFound();
  const kind = raw as TaxonomyKind;
  const rows = await loadRows(kind);

  const typeOptions =
    kind === "categories"
      ? [
          { value: "INDUSTRY", label: "Industry" },
          { value: "PEOPLE", label: "People category" },
          { value: "ORGANIZATION", label: "Organization type" },
          { value: "ARTICLE", label: "Article category" },
        ]
      : kind === "locations"
        ? [
            { value: "COUNTRY", label: "Country" },
            { value: "PROVINCE", label: "Province" },
            { value: "CITY", label: "City" },
          ]
        : undefined;
  const parentOptions =
    kind === "locations"
      ? rows.filter((r) => r.type === "COUNTRY").map((r) => ({ value: r.id, label: r.name }))
      : undefined;

  return (
    <>
      <AdminPageHeader title={TITLES[kind].title} description={TITLES[kind].description} />
      <TaxonomyManager key={kind} kind={kind} rows={rows} typeOptions={typeOptions} parentOptions={parentOptions} />
    </>
  );
}
