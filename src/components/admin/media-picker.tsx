"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { MAX_UPLOAD_BYTES, MAX_VIDEO_BYTES } from "@/lib/media-validation";
import { listMedia, uploadMedia, type MediaItem } from "@/server/actions/media";

export type PickedMedia = { id: string; url: string } | null;

const ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  video: "video/mp4,video/webm",
};

function Thumb({ url, kind, className }: { url: string; kind: "image" | "video"; className: string }) {
  return kind === "video" ? (
    <video src={url} muted playsInline preload="metadata" className={className} />
  ) : (
    <Image src={url} alt="" width={160} height={160} className={className} />
  );
}

/** Upload an image/video or pick one from the media library. */
export function MediaPicker({
  label,
  value,
  onChange,
  hint,
  kind = "image",
}: {
  label: string;
  value: PickedMedia;
  onChange: (m: PickedMedia) => void;
  hint?: string;
  kind?: "image" | "video";
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const maxBytes = kind === "video" ? MAX_VIDEO_BYTES : MAX_UPLOAD_BYTES;

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const load = (query = q) =>
    startTransition(async () => {
      const res = await listMedia({ q: query, kind });
      if (res.ok) setItems(res.data);
      else setError(res.message);
    });

  const upload = (file: File) => {
    setError(null);
    if (file.size > maxBytes) {
      setError(kind === "video" ? "Videos must be 50 MB or smaller." : "Images must be 5 MB or smaller.");
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadMedia(fd);
      if (res.ok && !res.data.mimeType.startsWith(`${kind}/`)) {
        setError(kind === "video" ? "Please choose a video file." : "Please choose an image file.");
      } else if (res.ok) {
        onChange({ id: res.data.id, url: res.data.url });
        setOpen(false);
      } else setError(res.message);
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-canvas">
          {value ? (
            <Thumb url={value.url} kind={kind} className="size-full object-cover" />
          ) : (
            <span className="text-xs text-muted">{kind === "video" ? "No video" : "No image"}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" disabled={pending} onClick={() => fileRef.current?.click()}>
            {pending ? "Uploading…" : "Upload"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setOpen(true);
              load();
            }}
          >
            Choose from library
          </button>
          {value && (
            <button type="button" className="btn-secondary" onClick={() => onChange(null)}>
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT[kind]}
          className="hidden"
          aria-label={`Upload ${label}`}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-xl p-0 backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <h2 className="font-semibold">Media library</h2>
          <div className="flex gap-2">
            <input
              type="search"
              value={q}
              placeholder="Search…"
              aria-label="Search media"
              onChange={(e) => {
                setQ(e.target.value);
                load(e.target.value);
              }}
              className="input w-56"
            />
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              {pending ? "Loading…" : "Nothing here yet. Use Upload to add one."}
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ id: m.id, url: m.url });
                      setOpen(false);
                    }}
                    className={`block w-full overflow-hidden rounded-lg border-2 ${value?.id === m.id ? "border-brand" : "border-transparent hover:border-brand/40"}`}
                    title={m.originalName}
                  >
                    <Thumb url={m.url} kind={kind} className="aspect-square w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </div>
  );
}
