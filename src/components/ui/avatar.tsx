import Image from "next/image";

const PALETTE = ["#dbeafe", "#dcfce7", "#fef3c7", "#fce7f3", "#e0e7ff", "#ccfbf1"];

function initials(name: string) {
  const parts = name
    .replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  return (parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
}

/** Photo/logo with a coloured initials fallback. `shape` square suits logos. */
export function Avatar({
  src,
  name,
  size = 56,
  shape = "circle",
}: {
  src: string | null;
  name: string;
  size?: number;
  shape?: "circle" | "square";
}) {
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className={`${radius} shrink-0 border border-line bg-white object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }
  const bg = PALETTE[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  return (
    <span
      aria-hidden="true"
      className={`${radius} grid shrink-0 place-items-center font-semibold text-ink-soft uppercase`}
      style={{ width: size, height: size, background: bg, fontSize: Math.round(size * 0.36) }}
    >
      {initials(name)}
    </span>
  );
}
