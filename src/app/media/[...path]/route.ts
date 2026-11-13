import { prisma } from "@/lib/db";
import { getStorage } from "@/lib/storage";

/**
 * Serves uploaded media from the storage provider. Only files registered in
 * the Media table are served, with their recorded (sniffed) content type.
 * Supports HTTP Range requests, which browsers (notably Safari) require for video.
 */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const key = (await params).path.join("/");
  const media = await prisma.media.findUnique({ where: { storageKey: key }, select: { mimeType: true } });
  if (!media) return new Response("Not found", { status: 404 });

  const data = await getStorage().get(key);
  if (!data) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": media.mimeType,
    "Accept-Ranges": "bytes",
    // Keys are unique per upload, so files never change.
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  };

  const range = request.headers.get("range");
  const match = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (match && (match[1] || match[2])) {
    const size = data.length;
    let start = match[1] ? Number(match[1]) : size - Number(match[2]);
    let end = match[1] && match[2] ? Number(match[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
    }
    return new Response(new Uint8Array(data.subarray(start, end + 1)), {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  return new Response(new Uint8Array(data), { headers: { ...headers, "Content-Length": String(data.length) } });
}
