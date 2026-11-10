"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { MAX_UPLOAD_BYTES } from "@/lib/media-validation";
import { deleteMedia, updateMediaAlt, uploadMedia, type MediaItem } from "@/server/actions/media";
import { FormAlert } from "./controls";

export function MediaLibrary({ items, canManage }: { items: (MediaItem & { usage: number })[]; canManage: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [alt, setAlt] = useState({ altText: "", altTextKm: "" });
  const [pending, start] = useTransition();

  const upload = (files: FileList) => {
    setMessage(null);
    start(async () => {
      let ok = 0;
      for (const file of Array.from(files)) {
        if (file.size > MAX_UPLOAD_BYTES) {
          setMessage({ kind: "error", text: `${file.name}: images must be 5 MB or smaller.` });
          continue;
        }
        const fd = new FormData();
        fd.set("file", file);
        const res = await uploadMedia(fd);
        if (res.ok) ok++;
        else setMessage({ kind: "error", text: `${file.name}: ${res.message}` });
      }
      if (ok) {
        setMessage((m) => m ?? { kind: "success", text: `Uploaded ${ok} image${ok > 1 ? "s" : ""}.` });
        router.refresh();
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          JPEG, PNG, WebP or GIF, up to 5 MB each. The file type is checked from its contents.
        </p>
        <button type="button" className="btn-primary" disabled={pending} onClick={() => fileRef.current?.click()}>
          {pending ? "Working…" : "Upload images"}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          aria-label="Upload images"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>
      {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
      {items.length === 0 ? (
        <p className="card p-10 text-center text-sm text-muted">No images yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <li key={m.id} className="card overflow-hidden">
              <Image
                src={m.url}
                alt={m.altText ?? ""}
                width={400}
                height={300}
                className="aspect-[4/3] w-full bg-canvas object-cover"
              />
              <div className="space-y-2 p-3 text-xs">
                <p className="truncate font-medium text-ink" title={m.originalName}>
                  {m.originalName}
                </p>
                <p className="text-muted">
                  {(m.sizeBytes / 1024).toFixed(0)} KB · {m.mimeType.replace("image/", "")} · used {m.usage}×
                </p>
                {editing === m.id ? (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      start(async () => {
                        const res = await updateMediaAlt(m.id, alt);
                        setMessage(
                          res.ok ? { kind: "success", text: "Alt text saved." } : { kind: "error", text: res.message },
                        );
                        if (res.ok) {
                          setEditing(null);
                          router.refresh();
                        }
                      });
                    }}
                  >
                    <label className="sr-only" htmlFor={`alt-${m.id}`}>
                      Alt text (English)
                    </label>
                    <input
                      id={`alt-${m.id}`}
                      className="input"
                      placeholder="Alt text (English)"
                      value={alt.altText}
                      onChange={(e) => setAlt((a) => ({ ...a, altText: e.target.value }))}
                    />
                    <label className="sr-only" htmlFor={`altkm-${m.id}`}>
                      Alt text (Khmer)
                    </label>
                    <input
                      id={`altkm-${m.id}`}
                      lang="km"
                      className="input"
                      placeholder="Alt text (Khmer)"
                      value={alt.altTextKm}
                      onChange={(e) => setAlt((a) => ({ ...a, altTextKm: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <button className="btn-primary px-3 py-1.5 text-xs" disabled={pending}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-xs"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-ink-soft">
                      {m.altText || <span className="text-muted italic">No alt text</span>}
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-brand hover:underline"
                        onClick={() => {
                          setEditing(m.id);
                          setAlt({ altText: m.altText ?? "", altTextKm: m.altTextKm ?? "" });
                        }}
                      >
                        Edit alt text
                      </button>
                      <button
                        type="button"
                        className="text-ink-soft hover:underline"
                        onClick={() => navigator.clipboard?.writeText(m.url)}
                      >
                        Copy URL
                      </button>
                      {canManage && (
                        <button
                          type="button"
                          className="ml-auto text-danger hover:underline disabled:opacity-50"
                          disabled={pending || m.usage > 0}
                          title={m.usage > 0 ? "In use — remove it from content first" : undefined}
                          onClick={() => {
                            if (!window.confirm(`Delete “${m.originalName}”? This cannot be undone.`)) return;
                            start(async () => {
                              const res = await deleteMedia(m.id);
                              setMessage(
                                res.ok ? { kind: "success", text: "Deleted." } : { kind: "error", text: res.message },
                              );
                              if (res.ok) router.refresh();
                            });
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
