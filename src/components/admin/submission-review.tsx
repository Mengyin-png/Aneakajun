"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reviewSubmission } from "@/server/actions/journeys-admin";
import { Card, FormAlert, SelectInput, TextArea, TextInput } from "./controls";

export const SUBMISSION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function SubmissionReview({ id, status, internalNotes }: { id: string; status: string; internalNotes: string }) {
  const router = useRouter();
  const [v, setV] = useState({ status, internalNotes, note: "" });
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await reviewSubmission(id, v);
          setMessage({ kind: res.ok ? "success" : "error", text: res.ok ? (res.message ?? "Saved.") : res.message });
          if (res.ok) {
            setV((s) => ({ ...s, note: "" }));
            router.refresh();
          }
        });
      }}
    >
      <Card title="Review" description="Status is visible to the member. Notes are internal and never shown to them.">
        {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
        <SelectInput
          label="Status"
          emptyLabel={null}
          value={v.status}
          onChange={(x) => setV((s) => ({ ...s, status: x }))}
          options={Object.entries(SUBMISSION_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <TextInput
          label="History note (internal)"
          value={v.note}
          onChange={(x) => setV((s) => ({ ...s, note: x }))}
          hint="Optional reason recorded with this status change."
        />
        <TextArea
          label="Internal notes"
          rows={6}
          value={v.internalNotes}
          onChange={(x) => setV((s) => ({ ...s, internalNotes: x }))}
          hint="Staff only."
        />
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save review"}
        </button>
      </Card>
    </form>
  );
}
