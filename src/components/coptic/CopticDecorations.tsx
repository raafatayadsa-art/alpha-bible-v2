import { cn } from "@/lib/utils";

export function CopticCross({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2v20M4 12h16" />
      <path d="M9 6h6M9 18h6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/**
 * Unified Alpha–Omega watermark — the core visual signature of Alpha Coptic.
 * Fixed full-viewport, extremely subtle (≈2% opacity), Ⲁ on the right and Ⲱ
 * on the left (RTL-natural pairing). Drop once per screen at the root.
 *
 * Variants:
 * - tone: "light" (default, warm gold) or "dark" (champagne on dark bg)
 * - position: "fixed" (default, viewport-wide) or "absolute" (parent must be relative)
 */
export function CopticWatermark({
  className = "",
  tone = "light",
  position = "fixed",
}: {
  className?: string;
  tone?: "light" | "dark";
  position?: "fixed" | "absolute";
}) {
  const color = tone === "dark" ? "#f0d78c" : "#7a4a14";
  const opacity = tone === "dark" ? 0.035 : 0.055;
  return (
    <div
      className={cn(
        "pointer-events-none inset-0 overflow-hidden select-none z-0",
        position === "fixed" ? "fixed" : "absolute",
        className,
      )}
      aria-hidden
    >
      <span
        className="absolute font-bold leading-none"
        style={{
          right: "-6vw",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "min(78vw, 78vh)",
          color,
          opacity,
        }}
      >
        Ⲁ
      </span>
      <span
        className="absolute font-bold leading-none"
        style={{
          left: "-6vw",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "min(78vw, 78vh)",
          color,
          opacity,
        }}
      >
        Ⲱ
      </span>
    </div>
  );
}

export function CopticSeparator({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 my-4 px-1", className)} aria-hidden>
      <div className="h-px flex-1 bg-gradient-to-l from-[#b8893a]/40 to-transparent" />
      <CopticCross className="text-[#b8893a]" size={16} />
      <div className="flex items-center gap-1">
        <span className="h-1 w-1 rounded-full bg-[#b8893a]/50" />
        <span className="h-1 w-1 rounded-full bg-[#b8893a]/70" />
        <span className="h-1 w-1 rounded-full bg-[#b8893a]/50" />
      </div>
      <CopticCross className="text-[#b8893a]" size={16} />
      <div className="h-px flex-1 bg-gradient-to-r from-[#b8893a]/40 to-transparent" />
    </div>
  );
}
