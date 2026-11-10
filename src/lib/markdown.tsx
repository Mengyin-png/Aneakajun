import type { ReactNode } from "react";

/**
 * Minimal, safe Markdown renderer for article bodies and bios.
 * Supports: ## / ### headings, paragraphs, "- " lists, "> " quotes,
 * **bold**, *italic*, and [links](https://…). Output is React elements only —
 * raw HTML in the source is shown as text, never injected.
 */
const SAFE_URL = /^(https?:\/\/|mailto:|\/)/i;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;
    if (match[2]) nodes.push(<strong key={key}>{match[2]}</strong>);
    else if (match[4]) nodes.push(<em key={key}>{match[4]}</em>);
    else if (match[6] && match[7]) {
      const href = match[7];
      nodes.push(
        SAFE_URL.test(href) ? (
          <a
            key={key}
            href={href}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            target={href.startsWith("http") ? "_blank" : undefined}
          >
            {match[6]}
          </a>
        ) : (
          match[6]
        ),
      );
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        if (block.startsWith("### ")) return <h3 key={key}>{renderInline(block.slice(4), key)}</h3>;
        if (block.startsWith("## ")) return <h2 key={key}>{renderInline(block.slice(3), key)}</h2>;
        const lines = block.split("\n");
        if (lines.every((l) => /^[-*] /.test(l))) {
          return (
            <ul key={key}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.slice(2), `${key}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => l.startsWith(">"))) {
          return (
            <blockquote key={key}>{renderInline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), key)}</blockquote>
          );
        }
        return (
          <p key={key}>
            {lines.flatMap((l, li) =>
              li === 0 ? renderInline(l, `${key}-${li}`) : [<br key={`br${li}`} />, ...renderInline(l, `${key}-${li}`)],
            )}
          </p>
        );
      })}
    </div>
  );
}
