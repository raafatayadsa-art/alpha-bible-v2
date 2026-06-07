import { cn } from "@/lib/utils";

/* ============================================================
   Alpha Coptic Design System
   - CopticCross
   - CopticMiniCross
   - CopticDivider
   - CopticSectionDivider
   - CopticTitle
   - CopticAlphaOmegaTitle
   - CopticWatermark  (global background signature)
   - CopticSeparator  (alias → CopticDivider, kept for back-compat)
   Gold token: #b8893a
   ============================================================ */

/* ------------------------------------------------------------
   CopticCross — authentic 4-arm cross with terminal bars
   ------------------------------------------------------------ */
export function CopticCross({
  className = "",
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Main arms */}
      <line x1="12" y1="2.5" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" />
      {/* Terminal T-bars */}
      <line x1="9.5" y1="2.5" x2="14.5" y2="2.5" />
      <line x1="9.5" y1="21.5" x2="14.5" y2="21.5" />
      <line x1="2.5" y1="9.5" x2="2.5" y2="14.5" />
      <line x1="21.5" y1="9.5" x2="21.5" y2="14.5" />
      {/* Center jewel */}
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/* ------------------------------------------------------------
   CopticMiniCross — small flared-arm Coptic cross for dividers
   ------------------------------------------------------------ */
export function CopticMiniCross({
  className = "",
  size = 12,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="8" y1="1.5" x2="8" y2="14.5" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" />
      <line x1="6.5" y1="1.5" x2="9.5" y2="1.5" />
      <line x1="6.5" y1="14.5" x2="9.5" y2="14.5" />
      <line x1="1.5" y1="6.5" x2="1.5" y2="9.5" />
      <line x1="14.5" y1="6.5" x2="14.5" y2="9.5" />
      <circle cx="8" cy="8" r="1.2" />
    </svg>
  );
}

/* ------------------------------------------------------------
   CopticDivider — horizontal section divider
   Use between content sections.
   ------------------------------------------------------------ */
export function CopticDivider({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const gold = tone === "dark" ? "text-[#f0d78c]" : "text-[#b8893a]";
  const line =
    tone === "dark"
      ? "from-[#f0d78c]/35 to-transparent"
      : "from-[#b8893a]/40 to-transparent";

  return (
    <div
      className={cn("flex items-center gap-3 my-4 px-1", className)}
      aria-hidden
    >
      <div className={cn("h-px flex-1 bg-gradient-to-l", line)} />
      <CopticMiniCross className={gold} size={14} />
      <div className={cn("h-px flex-1 bg-gradient-to-r", line)} />
    </div>
  );
}

/* ------------------------------------------------------------
   CopticSectionDivider — prominent Ⲁ ─── ✚ ─── Ⲱ divider
   Use between major page sections.
   ------------------------------------------------------------ */
export function CopticSectionDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-2.5 my-5 px-1", className)}
      aria-hidden
    >
      <span className="text-[#b8893a]/60 text-[11px] font-bold leading-none">Ⲁ</span>
      <div className="h-px flex-1 bg-gradient-to-r from-[#b8893a]/55 via-[#b8893a]/20 to-transparent" />
      <CopticCross className="text-[#b8893a]" size={18} />
      <div className="h-px flex-1 bg-gradient-to-l from-[#b8893a]/55 via-[#b8893a]/20 to-transparent" />
      <span className="text-[#b8893a]/60 text-[11px] font-bold leading-none">Ⲱ</span>
    </div>
  );
}

/* ------------------------------------------------------------
   CopticTitle — section heading:  Ⲁ {children} ─── Ⲱ
   Drop-in replacement for the repeated inline heading pattern.
   ------------------------------------------------------------ */
export function CopticTitle({
  children,
  className,
  as: Tag = "h3",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
}) {
  return (
    <Tag
      className={cn(
        "mt-5 mb-2 px-1 font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] flex items-center gap-2",
        className,
      )}
    >
      <span className="text-[#b8893a]/65 text-[12px]" aria-hidden>Ⲁ</span>
      {children}
      <span className="flex-1 h-px bg-[#ead9b1]" aria-hidden />
      <span className="text-[#b8893a]/65 text-[12px]" aria-hidden>Ⲱ</span>
    </Tag>
  );
}

/* ------------------------------------------------------------
   CopticAlphaOmegaTitle — hero screen-title block:
     CopticCross
     Ⲁ {title} Ⲱ
     {subtitle?}
   Used in the AlphaHeader center prop for Synaxarium / Katameros.
   ------------------------------------------------------------ */
export function CopticAlphaOmegaTitle({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center -mt-1", className)}>
      <CopticCross className="text-[#b8893a]" size={18} />
      <h1 className="font-arabic-serif text-[20px] font-extrabold text-[#3a2a18] leading-tight">
        <span className="text-[#b8893a]/60 text-[14px]" aria-hidden>Ⲁ</span>
        {" "}{title}{" "}
        <span className="text-[#b8893a]/60 text-[14px]" aria-hidden>Ⲱ</span>
      </h1>
      {subtitle && (
        <p className="text-[10.5px] text-[#6a543a] -mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------
   CopticWatermark — full-viewport Ⲁ Ⲱ background signature
   Drop once at the screen root. Never inside cards.
   ------------------------------------------------------------ */
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

/** @deprecated Use CopticDivider */
export function CopticSeparator({ className = "" }: { className?: string }) {
  return <CopticDivider className={className} />;
}
