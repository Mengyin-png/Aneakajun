import { prisma } from "@/lib/db";
import { getStorage } from "@/lib/storage";

/**
 * Serves uploaded media from the storage provider. Only files registered in
 * the Media table are served, with their recorded (sniffed) content type.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const key = (await params).path.join("/");
  const media = await prisma.media.findUnique({ where: { storageKey: key }, select: { mimeType: true } });
  if (!media) return new Response("Not found", { status: 404 });

  const data = await getStorage().get(key);
  if (!data) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(data.length),
      // Keys are unique per upload, so files never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
