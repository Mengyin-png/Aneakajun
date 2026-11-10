import Image from "next/image";

const TINTS = ["#e6f2f0", "#eef3e6", "#f3efe6", "#e8eef5", "#f1e8ee", "#e9f1f4"];

function initials(name: string) {
  const parts = name
    .replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/**
 * Image area of a listing card: the uploaded photo/logo, or a tinted panel
 * with initials until one is uploaded (never a fake stock image).
 */
export function MediaPanel({
  src,
  name,
  sizes,
  className = "",
  fit = "cover",
  dark = false,
}: {
  src: string | null;
  name: string;
  sizes: string;
  className?: string;
  fit?: "cover" | "contain";
  dark?: boolean;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${fit === "contain" ? "bg-white" : "bg-pill"} ${className}`}>
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain p-6" : "object-cover"}
        />
      </div>
    );
  }
  const tint = TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  return (
    <div
      aria-hidden="true"
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{ background: dark ? "linear-gradient(135deg,#0b3d36,#09786a)" : tint }}
    >
      <span className={`text-5xl font-extrabold tracking-tight ${dark ? "text-white/25" : "text-brand/35"}`}>
        {initials(name)}
      </span>
    </div>
  );
}
