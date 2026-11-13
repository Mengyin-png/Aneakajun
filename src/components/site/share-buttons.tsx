"use client";

import { useState } from "react";

export function ShareButtons({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: { share: string; copyLink: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-ink">{labels.share}:</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          {l.name}
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      ))}
      <button
        type="button"
        className="btn-secondary px-3 py-1.5 text-xs"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt(labels.copyLink, url);
          }
        }}
      >
        {copied ? labels.copied : labels.copyLink}
      </button>
      <span role="status" className="sr-only">
        {copied ? labels.copied : ""}
      </span>
    </div>
  );
}
