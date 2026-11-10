"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/validation/content";

/**
 * Shared editor state: controlled values, server-side field errors, save
 * status, and redirect to the edit page after creating a record.
 */
export function useEntityForm<T>(
  initial: T,
  save: (values: T) => Promise<ActionResult<{ id: string; slug: string }>>,
  editPath: (id: string) => string,
  isNew: boolean,
) {
  const router = useRouter();
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [saving, startSave] = useTransition();

  const patch = useCallback((p: Partial<T>) => setValues((v) => ({ ...v, ...p })), []);

  const submit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      setMessage(null);
      startSave(async () => {
        const res = await save(values);
        if (res.ok) {
          setErrors({});
          // The edit page re-mounts the form with the saved (normalised) values,
          // e.g. a generated slug; the confirmation is carried in the URL.
          router.replace(`${editPath(res.data.id)}?${isNew ? "created" : "saved"}=1`, { scroll: false });
          router.refresh();
        } else {
          setErrors(res.errors ?? {});
          setMessage({ kind: "error", text: res.message });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    },
    [values, save, editPath, isNew, router],
  );

  return { values, setValues, patch, errors, message, saving, submit };
}
