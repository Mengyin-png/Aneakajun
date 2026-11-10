"use client";

import type { ContentStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ActionResult } from "@/lib/validation/content";
import { Checkbox, SelectInput, TextInput } from "./controls";

export const STATUS_LABEL: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export type WorkflowValues = { slug: string; status: ContentStatus; isFeatured: boolean; sortOrder: number | string };

/**
 * Status, featured flag, display order, slug, save/delete and preview —
 * shared by the person, organization and article editors.
 */
export function PublishPanel({
  values,
  onChange,
  errors,
  canPublish,
  canDelete,
  saving,
  publicPath,
  previewPath,
  isPublished,
  onDelete,
  listPath,
  meta,
}: {
  values: WorkflowValues;
  onChange: (patch: Partial<WorkflowValues>) => void;
  errors: Record<string, string>;
  canPublish: boolean;
  canDelete: boolean;
  saving: boolean;
  publicPath: string | null;
  previewPath: string | null;
  isPublished: boolean;
  onDelete?: () => Promise<ActionResult>;
  listPath: string;
  meta?: { createdAt?: string; updatedAt?: string; createdBy?: string | null };
}) {
  const router = useRouter();
  const [deleting, startDelete] = useTransition();
  const statusOptions = (
    canPublish ? ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] : ["DRAFT", "IN_REVIEW"]
  ) as ContentStatus[];

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold text-ink">Publishing</h2>
        <SelectInput
          label="Status"
          value={values.status}
          onChange={(v) => onChange({ status: v as ContentStatus })}
          options={statusOptions.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          emptyLabel={null}
          error={errors.status}
          hint={
            canPublish
              ? "Only Published content is visible on the website."
              : "Set to “In review” to submit for approval."
          }
        />
        <Checkbox
          label="Featured"
          hint={canPublish ? "Shown on the homepage." : "Editors decide what is featured."}
          checked={values.isFeatured}
          disabled={!canPublish}
          onChange={(v) => onChange({ isFeatured: v })}
        />
        <TextInput
          label="Display order"
          type="number"
          value={values.sortOrder}
          onChange={(v) => onChange({ sortOrder: v })}
          error={errors.sortOrder}
          hint="Lower numbers appear first in featured lists."
        />
        <TextInput
          label="URL slug"
          value={values.slug}
          onChange={(v) => onChange({ slug: v })}
          error={errors.slug}
          hint="Leave empty to generate from the English name."
          placeholder="auto"
        />
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <div className="flex flex-wrap gap-2">
          {previewPath && (
            <a href={previewPath} target="_blank" rel="noopener" className="btn-secondary flex-1">
              Preview
            </a>
          )}
          {publicPath && isPublished && (
            <a href={publicPath} target="_blank" rel="noopener" className="btn-secondary flex-1">
              View live ↗
            </a>
          )}
        </div>
      </section>

      {meta && (meta.createdAt || meta.updatedAt) && (
        <section className="card space-y-1 p-5 text-xs text-muted">
          {meta.createdAt && (
            <p>
              Created {new Date(meta.createdAt).toLocaleString("en-GB")}
              {meta.createdBy ? ` by ${meta.createdBy}` : ""}
            </p>
          )}
          {meta.updatedAt && <p>Last updated {new Date(meta.updatedAt).toLocaleString("en-GB")}</p>}
        </section>
      )}

      {onDelete && canDelete && (
        <button
          type="button"
          className="btn-danger w-full"
          disabled={deleting}
          onClick={() => {
            if (!window.confirm("Delete this permanently? This cannot be undone.")) return;
            startDelete(async () => {
              const res = await onDelete();
              if (res.ok) {
                router.push(`${listPath}?deleted=1`);
                router.refresh();
              } else window.alert(res.message);
            });
          }}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      )}
      <Link href={listPath} className="block text-center text-sm text-muted hover:text-ink">
        ← Back to list
      </Link>
    </aside>
  );
}
