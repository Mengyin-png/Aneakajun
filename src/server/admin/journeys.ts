import "server-only";
import type { GuidanceFormValues } from "@/components/admin/guidance-form";
import { prisma } from "@/lib/db";

const media = (m: { id: string; url: string } | null) => (m ? { id: m.id, url: m.url } : null);

export async function journeyOptions() {
  const rows = await prisma.journey.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true } });
  return rows.map((j) => ({ value: j.id, label: j.title }));
}

export async function adminListGuidance(f: { journeyId?: string; status?: string; mine?: string }) {
  return prisma.guidanceArticle.findMany({
    where: {
      ...(f.journeyId ? { journeyId: f.journeyId } : {}),
      ...(f.status ? { status: f.status as "DRAFT" } : {}),
      ...(f.mine ? { createdById: f.mine } : {}),
    },
    orderBy: [{ journey: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    take: 200,
    select: {
      id: true,
      slug: true,
      status: true,
      isFeatured: true,
      lastReviewedAt: true,
      updatedAt: true,
      journey: { select: { key: true, title: true } },
      translations: { select: { locale: true, title: true } },
      _count: { select: { sections: true, references: true } },
    },
  });
}

export async function loadGuidanceForm(
  id: string,
): Promise<(GuidanceFormValues & { createdById: string | null }) | null> {
  const g = await prisma.guidanceArticle.findUnique({
    where: { id },
    include: {
      translations: true,
      cover: { select: { id: true, url: true } },
      video: { select: { id: true, url: true } },
      reviewedBy: { select: { name: true } },
      sections: { orderBy: { sortOrder: "asc" }, include: { image: { select: { id: true, url: true } } } },
      references: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!g) return null;
  const tr = (locale: "en" | "km") => {
    const t = g.translations.find((x) => x.locale === locale);
    return {
      title: t?.title ?? "",
      summary: t?.summary ?? "",
      nextSteps: t?.nextSteps ?? "",
      seoTitle: t?.seoTitle ?? "",
      seoDescription: t?.seoDescription ?? "",
    };
  };
  return {
    createdById: g.createdById,
    journeyId: g.journeyId,
    slug: g.slug,
    status: g.status,
    isFeatured: g.isFeatured,
    sortOrder: g.sortOrder,
    cover: media(g.cover),
    video: media(g.video),
    lastReviewedAt: g.lastReviewedAt ? g.lastReviewedAt.toISOString().slice(0, 10) : "",
    reviewedBy: g.reviewedBy?.name ?? null,
    translations: { en: tr("en"), km: tr("km") },
    sections: g.sections.map((s) => ({
      kind: s.kind,
      heading: s.heading,
      headingKm: s.headingKm ?? "",
      body: s.body,
      bodyKm: s.bodyKm ?? "",
      image: media(s.image),
    })),
    references: g.references.map((r) => ({
      title: r.title,
      titleKm: r.titleKm ?? "",
      url: r.url,
      publisher: r.publisher ?? "",
    })),
  };
}

export async function adminListForms() {
  return prisma.journeyForm.findMany({
    orderBy: [{ journey: { sortOrder: "asc" } }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      isActive: true,
      updatedAt: true,
      journey: { select: { title: true } },
      _count: { select: { fields: true, submissions: true } },
    },
  });
}

export async function loadJourneyForm(id: string) {
  return prisma.journeyForm.findUnique({ where: { id }, include: { fields: { orderBy: { sortOrder: "asc" } } } });
}

export const SUBMISSION_STATUSES = ["PENDING", "IN_REVIEW", "APPROVED", "REJECTED"] as const;

export async function adminListSubmissions(f: { status?: string; journeyId?: string; page: number }) {
  const where = {
    ...(f.status && (SUBMISSION_STATUSES as readonly string[]).includes(f.status)
      ? { status: f.status as "PENDING" }
      : {}),
    ...(f.journeyId ? { journeyId: f.journeyId } : {}),
  };
  const take = 25;
  const [items, total, counts] = await Promise.all([
    prisma.formSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * take,
      take,
      select: {
        id: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        user: { select: { name: true, email: true } },
        form: { select: { title: true } },
        journey: { select: { title: true } },
        reviewer: { select: { name: true } },
      },
    }),
    prisma.formSubmission.count({ where }),
    prisma.formSubmission.groupBy({ by: ["status"], _count: true }),
  ]);
  return {
    items,
    total,
    take,
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count])) as Record<string, number>,
  };
}

export async function loadSubmission(id: string) {
  return prisma.formSubmission.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      form: { select: { title: true } },
      journey: { select: { title: true, key: true } },
      reviewer: { select: { name: true } },
      answers: { include: { field: { select: { type: true, options: true, sortOrder: true } } } },
      history: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true } } } },
    },
  });
}
