/** Upload rules shared by the uploader UI and the server. SVG is excluded (can carry scripts). */
export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type ImageMime = keyof typeof IMAGE_TYPES;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Detects the real type from the file's first bytes; the browser-reported type is not trusted. */
export function sniffImageType(bytes: Uint8Array): ImageMime | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "image/gif";
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  )
    return "image/webp";
  return null;
}

/** Background/cover videos (cinematic heroes). Kept short and compressed by editors. */
export const VIDEO_TYPES = { "video/mp4": "mp4", "video/webm": "webm" } as const;
export type VideoMime = keyof typeof VIDEO_TYPES;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MEDIA_EXT: Record<ImageMime | VideoMime, string> = { ...IMAGE_TYPES, ...VIDEO_TYPES };

export function sniffVideoType(b: Uint8Array): VideoMime | null {
  // ISO base media (MP4/MOV family): "ftyp" box at offset 4.
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return "video/mp4";
  // Matroska/WebM EBML header.
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "video/webm";
  return null;
}

/** Image or video type from file bytes, with the size limit that applies to it. */
export function sniffMediaType(
  bytes: Uint8Array,
): { mime: ImageMime | VideoMime; kind: "image" | "video"; maxBytes: number } | null {
  const image = sniffImageType(bytes);
  if (image) return { mime: image, kind: "image", maxBytes: MAX_UPLOAD_BYTES };
  const video = sniffVideoType(bytes);
  if (video) return { mime: video, kind: "video", maxBytes: MAX_VIDEO_BYTES };
  return null;
}
