import * as React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * Shared design primitives for the Alpha Bible Scripture Experience.
 * Warm beige + ivory base, purple/gold accents, glass surfaces.
 */

export const palette = {
  bg: "#f4ead8",
  surface: "#fbf3e1",
  surfaceBorder: "#efe2c4",
  ink: "#3a2a18",
  inkSoft: "#6a543a",
  gold: "#b8893a",
  goldDeep: "#7a4a26",
  goldLight: "#e7c97a",
  purple: "#6a4ab5",
  purpleSoft: "#a78bd9",
} as const;

export function Pressable({
  children,
  onClick,
  to,
  params,
  search,
  className = "",
  ariaLabel,
  as = "auto",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, any>;
  className?: string;
  ariaLabel?: string;
  as?: "auto" | "div";
}) {
  const base = cn(
    "block w-full text-right transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c79356]/60 rounded-[inherit]",
    className,
  );
  if (to) {
    return (
      <Link to={to as any} params={params as any} search={search as any} aria-label={ariaLabel} className={base}>
        {children}
      </Link>
    );
  }
  if (as === "div" || !onClick) {
    return <div aria-label={ariaLabel} className={base}>{children}</div>;
  }
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={base}>
      {children}
    </button>
  );
}


export function GlassSurface({
  children,
  className = "",
  tone = "warm",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "warm" | "ivory" | "purple";
}) {
  const toneClass =
    tone === "purple"
      ? "bg-gradient-to-br from-[#efe7fb]/90 to-[#fbf3e1]/80"
      : tone === "ivory"
      ? "bg-white/85"
      : "bg-[#fbf3e1]/85";
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/70 backdrop-blur-xl",
        "shadow-[0_14px_36px_-22px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.75)]",
        toneClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  caption,
}: {
  title: string;
  action?: React.ReactNode;
  caption?: string;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
      <div>
        <h2 className="text-[14px] font-extrabold text-[#3a2a18] leading-none">{title}</h2>
        {caption && (
          <p className="mt-1 text-[11px] text-[#6a543a]">{caption}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({
  value,
  showLabel = false,
  className = "",
  tone = "gold",
}: {
  value: number; // 0..100
  showLabel?: boolean;
  className?: string;
  tone?: "gold" | "purple";
}) {
  const v = Math.max(0, Math.min(100, value));
  const bar =
    tone === "purple"
      ? "from-[#a78bd9] to-[#6a4ab5]"
      : "from-[#e7c97a] via-[#c79356] to-[#7a4a26]";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-1.5 flex-1 rounded-full bg-[#ecdcb6] overflow-hidden"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-500", bar)}
          style={{ width: `${v}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-bold text-[#7a4a26] tabular-nums">{Math.round(v)}%</span>
      )}
    </div>
  );
}

export function PlaceholderArt({
  label,
  tone = "gold",
  className = "",
  rounded = "rounded-2xl",
}: {
  label?: string;
  tone?: "gold" | "purple" | "ivory";
  className?: string;
  rounded?: string;
}) {
  const grad =
    tone === "purple"
      ? "from-[#dccdf3] via-[#c8b5ec] to-[#8c6fd1]"
      : tone === "ivory"
      ? "from-[#fff8e9] via-[#f5e7c2] to-[#e7d4a4]"
      : "from-[#f7e1ad] via-[#e7c07a] to-[#a87a35]";
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        grad,
        rounded,
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_22px_-14px_rgba(120,80,30,0.45)]",
        className,
      )}
      aria-hidden={!label}
    >
      <div
        className="absolute inset-0 opacity-50 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 20%, rgba(255,255,255,0.7), transparent 60%), radial-gradient(50% 60% at 80% 90%, rgba(0,0,0,0.18), transparent 60%)",
        }}
      />
      {label && (
        <div className="absolute inset-0 grid place-items-center px-3 text-center">
          <span className="font-arabic-serif text-[15px] font-bold text-[#3a2a18]/70 leading-tight">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export function IconBadge({
  children,
  tone = "gold",
  size = 40,
}: {
  children: React.ReactNode;
  tone?: "gold" | "purple" | "ivory";
  size?: number;
}) {
  const bg =
    tone === "purple"
      ? "bg-gradient-to-br from-[#efe7fb] to-[#cdb8ef] text-[#4a2f8a]"
      : tone === "ivory"
      ? "bg-white text-[#3a2a18]"
      : "bg-gradient-to-br from-[#fff1c7] to-[#e7c07a] text-[#7a4a26]";
  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl border border-white/70 shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4),inset_0_1px_0_rgba(255,255,255,0.8)]",
        bg,
      )}
      style={{ height: size, width: size }}
    >
      {children}
    </div>
  );
}

export function BackButton({
  to,
  label = "رجوع",
  compact = false,
  tone = "light",
}: {
  to?: string;
  label?: string;
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const inner = compact ? (
    <span
      aria-label={label}
      className={cn(
        "inline-grid h-9 w-9 place-items-center rounded-full border backdrop-blur-xl active:scale-90 transition-transform",
        tone === "dark"
          ? "bg-[#0e1a2e]/55 border-white/10 text-[#f3e6c4]"
          : "bg-white/70 border-[#efe2c4] text-[#3a2a18]",
      )}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M7 4l6 6-6 6" />
      </svg>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-[#efe2c4] px-3 py-1.5 text-[12px] font-bold text-[#3a2a18] shadow-[0_6px_14px_-10px_rgba(120,80,30,0.35)]">
      <span aria-hidden>→</span>
      {label}
    </span>
  );
  if (to) {
    return (
      <Link to={to as any} aria-label={label} className="inline-block active:scale-95 transition-transform">
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => history.back()}
      className="inline-block active:scale-95 transition-transform"
    >
      {inner}
    </button>
  );
}
