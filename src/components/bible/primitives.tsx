import * as React from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * Shared design primitives for the Alpha Bible Scripture Experience.
 * Warm beige + ivory base, purple/gold accents, glass surfaces.
 */

export const palette = {
  bg: "var(--alpha-bg-base)",
  surface: "var(--alpha-bg-elevated)",
  surfaceBorder: "var(--alpha-border)",
  ink: "var(--alpha-text)",
  inkSoft: "var(--alpha-text-muted)",
  gold: "var(--alpha-gold-deep)",
  goldDeep: "var(--alpha-gold-deep)",
  goldLight: "var(--alpha-gold)",
  purple: "var(--alpha-purple)",
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
  search?: Record<string, unknown>;
  className?: string;
  ariaLabel?: string;
  as?: "auto" | "div";
}) {
  const base = cn(
    "block w-full text-right alpha-motion-spring active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alpha-gold-deep)]/60 rounded-[inherit]",
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
      ? "bg-gradient-to-br from-[color-mix(in_srgb,var(--alpha-purple)_12%,var(--alpha-bg-elevated))] to-[color-mix(in_srgb,var(--alpha-bg-elevated)_90%,transparent)]"
      : tone === "ivory"
      ? "bg-white/85"
      : "bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_85%,transparent)]";
  return (
    <div
      className={cn(
        "rounded-[var(--alpha-radius-card)] border border-white/70 backdrop-blur-xl shadow-[var(--alpha-shadow-featured)]",
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
        <h2 className="alpha-type-h2 text-alpha-heading leading-none">{title}</h2>
        {caption && (
          <p className="alpha-type-desc mt-1 text-alpha-description">{caption}</p>
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
      ? "from-[#a78bd9] to-[var(--alpha-purple)]"
      : "from-[var(--alpha-gold)] via-[var(--alpha-gold-deep)] to-[var(--alpha-gold-deep)]";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-1.5 flex-1 rounded-full bg-alpha-progress-track overflow-hidden"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full bg-gradient-to-r alpha-motion-standard transition-[width]", bar)}
          style={{ width: `${v}%`, transitionDuration: "500ms" }}
        />
      </div>
      {showLabel && (
        <span className="alpha-type-desc font-bold text-alpha-gold-deep tabular-nums">{Math.round(v)}%</span>
      )}
    </div>
  );
}

export function PlaceholderArt({
  label,
  tone = "gold",
  className = "",
  rounded = "rounded-[var(--alpha-radius-dock-tab)]",
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
        "shadow-[var(--alpha-shadow-normal)]",
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
          <span className="alpha-type-h2 font-arabic-serif text-alpha-heading/70 leading-tight">
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
      ? "bg-gradient-to-br from-[color-mix(in_srgb,var(--alpha-purple)_14%,white)] to-[#cdb8ef] text-[var(--alpha-purple)]"
      : tone === "ivory"
      ? "bg-white text-alpha-heading"
      : "bg-gradient-to-br from-[color-mix(in_srgb,var(--alpha-gold)_22%,white)] to-[var(--alpha-gold)] text-alpha-gold-deep";
  return (
    <div
      className={cn(
        "grid place-items-center rounded-[var(--alpha-radius-dock-tab)] border border-white/70 shadow-[var(--alpha-shadow-normal)]",
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
  params,
  onBack,
  label = "رجوع",
  compact = false,
  tone = "light",
}: {
  to?: string;
  params?: Record<string, string>;
  onBack?: () => void;
  label?: string;
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const router = useRouter();

  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    const idx =
      typeof window !== "undefined"
        ? (((window.history.state as Record<string, unknown>)?.idx as number) ?? 0)
        : 0;
    if (idx > 0) {
      router.history.back();
      return;
    }
    if (to) {
      void router.navigate({ to: to as any, params: params as any });
      return;
    }
    router.history.back();
  }, [router, to, params, onBack]);

  const inner = compact ? (
    <span
      aria-label={label}
      className={cn(
        "inline-grid h-9 w-9 place-items-center rounded-full border backdrop-blur-xl active:scale-90 alpha-motion-spring",
        tone === "dark"
          ? "bg-[color-mix(in_srgb,var(--alpha-bg-base)_55%,transparent)] border-white/10 text-[var(--alpha-reader-text-soft)]"
          : "bg-white/70 border-alpha text-alpha-heading",
      )}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M7 4l6 6-6 6" />
      </svg>
    </span>
  ) : (
    <span className="alpha-type-body inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-alpha px-3 py-1.5 font-bold text-alpha-heading shadow-[var(--alpha-shadow-normal)]">
      <span aria-hidden>→</span>
      {label}
    </span>
  );

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleBack}
      className="inline-block active:scale-95 alpha-motion-spring"
    >
      {inner}
    </button>
  );
}
