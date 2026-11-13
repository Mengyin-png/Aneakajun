/**
 * Guest preview of guidance articles: guests may read the first 40% of the
 * article body; the rest stays on the server.
 *
 * The measure is the number of plain-text characters in section bodies (Markdown
 * syntax removed, whitespace collapsed); headings are not counted. Whole
 * paragraphs are included until the next one would cross the 40% budget; that
 * paragraph is cut at the last word boundary inside the budget. The locked
 * text is never part of the output — only locked section headings are, so the
 * table of contents can show what signing in unlocks.
 */
export const GUEST_SHARE = 0.4;

export type PreviewInput = { id: string; heading: string; kind: string; body: string; imageUrl?: string | null };

export type VisibleSection = PreviewInput & {
  /** Plain-text tail of a paragraph that was cut at the boundary (rendered faded). */
  cutText?: string;
};

export type GuidancePreview = {
  locked: boolean;
  visible: VisibleSection[];
  lockedHeadings: { id: string; heading: string }[];
  shownChars: number;
  totalChars: number;
};

/** Markdown → plain text used for measuring. Shared with tests. */
export function plainBlock(block: string): string {
  return block
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*>]\s+/gm, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const blocksOf = (body: string) =>
  body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

export function measure(sections: { body: string }[]): number {
  return sections.reduce((sum, s) => sum + blocksOf(s.body).reduce((a, b) => a + plainBlock(b).length, 0), 0);
}

export function buildPreview(sections: PreviewInput[], fullAccess: boolean): GuidancePreview {
  const totalChars = measure(sections);
  if (fullAccess) {
    return { locked: false, visible: sections, lockedHeadings: [], shownChars: totalChars, totalChars };
  }

  const budget = Math.floor(totalChars * GUEST_SHARE);
  let used = 0;
  let done = false;
  const visible: VisibleSection[] = [];
  const lockedHeadings: { id: string; heading: string }[] = [];

  for (const section of sections) {
    if (done) {
      lockedHeadings.push({ id: section.id, heading: section.heading });
      continue;
    }
    const kept: string[] = [];
    let cutText: string | undefined;
    for (const block of blocksOf(section.body)) {
      const plain = plainBlock(block);
      if (used + plain.length <= budget) {
        kept.push(block);
        used += plain.length;
        continue;
      }
      const remaining = budget - used;
      if (remaining > 0) {
        const slice = plain.slice(0, remaining);
        const lastSpace = slice.lastIndexOf(" ");
        const cut = (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd();
        if (cut) {
          cutText = cut;
          used += cut.length;
        }
      }
      done = true;
      break;
    }
    if (kept.length || cutText) {
      visible.push({ ...section, body: kept.join("\n\n"), cutText });
    } else {
      lockedHeadings.push({ id: section.id, heading: section.heading });
    }
  }

  return { locked: totalChars > 0 && used < totalChars, visible, lockedHeadings, shownChars: used, totalChars };
}
