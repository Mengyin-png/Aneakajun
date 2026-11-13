"use client";

/** Small helpers for editing ordered lists (sections, references, form fields). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function RowControls({
  index,
  count,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  label: string;
}) {
  const btn = "rounded border border-line px-2 py-1 text-xs hover:bg-canvas disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className={btn}
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        aria-label={`Move ${label} up`}
      >
        ↑
      </button>
      <button
        type="button"
        className={btn}
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
        aria-label={`Move ${label} down`}
      >
        ↓
      </button>
      <button type="button" className={`${btn} text-danger`} onClick={onRemove} aria-label={`Remove ${label}`}>
        Remove
      </button>
    </div>
  );
}

/** Field error lookup for nested paths like "sections.2.body". */
export const errAt = (errors: Record<string, string>, path: string) => errors[path];
