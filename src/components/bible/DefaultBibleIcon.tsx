import { cn } from "@/lib/utils";

/** Built-in SVG fallback — no external asset required. */
export function DefaultBibleIcon({
  className,
  size,
  label = "الكتاب المقدس",
}: {
  className?: string;
  size?: number;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      className={cn("w-full h-full", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="ab-bible-cover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5c3d7a" />
          <stop offset="100%" stopColor="#2a1840" />
        </linearGradient>
        <linearGradient id="ab-bible-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7e1ad" />
          <stop offset="100%" stopColor="#c79356" />
        </linearGradient>
      </defs>
      <rect x="28" y="22" width="64" height="76" rx="8" fill="url(#ab-bible-cover)" />
      <rect x="32" y="26" width="56" height="68" rx="5" fill="#3a2850" opacity="0.35" />
      <path
        d="M52 48 L60 38 L68 48 L68 72 L52 72 Z"
        fill="none"
        stroke="url(#ab-bible-gold)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="60" y1="38" x2="60" y2="32" stroke="#e7c97a" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="34" x2="64" y2="34" stroke="#e7c97a" strokeWidth="2" strokeLinecap="round" />
      {[56, 64, 72, 80].map((y) => (
        <rect key={y} x="38" y={y} width="44" height="2" rx="1" fill="#e7c97a" opacity="0.35" />
      ))}
      <ellipse cx="60" cy="98" rx="34" ry="6" fill="#c79356" opacity="0.2" />
    </svg>
  );
}
