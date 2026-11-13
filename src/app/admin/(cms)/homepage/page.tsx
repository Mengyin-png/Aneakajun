import { AdminPageHeader } from "@/components/admin/admin-table";
import { HomepageForm } from "@/components/admin/homepage-form";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { parseResources, parseSections } from "@/server/queries/journeys";

export const metadata = { title: "Homepage" };

export default async function Page() {
  await requireUser("settings.manage");
  const h = await prisma.homepageSettings.findUnique({
    where: { id: 1 },
    include: { heroVideo: { select: { id: true, url: true } }, heroImage: { select: { id: true, url: true } } },
  });
  return (
    <>
      <AdminPageHeader title="Homepage" description="Hero sentence, background media, section order and resources." />
      <HomepageForm
        initial={{
          heroPrefix: h?.heroPrefix ?? "I want to",
          heroPrefixKm: h?.heroPrefixKm ?? "",
          heroSuffix: h?.heroSuffix ?? "in Cambodia.",
          heroSuffixKm: h?.heroSuffixKm ?? "",
          heroSubtitle: h?.heroSubtitle ?? "",
          heroSubtitleKm: h?.heroSubtitleKm ?? "",
          ctaLabel: h?.ctaLabel ?? "Learn more",
          ctaLabelKm: h?.ctaLabelKm ?? "",
          heroVideo: h?.heroVideo ?? null,
          heroImage: h?.heroImage ?? null,
          sections: parseSections(h?.sections),
          resources: parseResources(h?.resources).map((r) => ({
            title: r.title,
            titleKm: r.titleKm ?? "",
            url: r.url,
            description: r.description ?? "",
            descriptionKm: r.descriptionKm ?? "",
          })),
        }}
      />
    </>
  );
}
