import { AdminPageHeader } from "@/components/admin/admin-table";
import { MediaLibrary } from "@/components/admin/media-library";
import { can, requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const metadata = { title: "Media library" };

export default async function MediaPage() {
  const user = await requireUser("media.upload");
  const rows = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: {
        select: { personPhotos: true, orgLogos: true, orgCovers: true, articleFeatured: true, eventImages: true },
      },
    },
  });
  const items = rows.map(({ _count, ...m }) => ({
    id: m.id,
    url: m.url,
    originalName: m.originalName,
    altText: m.altText,
    altTextKm: m.altTextKm,
    sizeBytes: m.sizeBytes,
    mimeType: m.mimeType,
    createdAt: m.createdAt.toISOString(),
    usage: Object.values(_count).reduce((a, b) => a + b, 0),
  }));
  return (
    <>
      <AdminPageHeader title="Media library" description="Images used for photos, logos, covers and featured images." />
      <MediaLibrary items={items} canManage={can(user, "media.manage")} />
    </>
  );
}
