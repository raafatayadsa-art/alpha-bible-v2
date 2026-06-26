import type { ComponentType, CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Link2, MapPin, Siren, type LucideIcon } from "lucide-react";
import controlCenterBg from "@/assets/control-center-bg.png";
import { MC } from "./platform-store";

export const PP_GOLD = "#e7c97a";
export const PP_GOLD_BRIGHT = "#f0d78c";
export const PP_BLUE = "#8fd4ff";

/** Western digits only — platform control standard */
export function formatPlatformNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function PlatformPremiumStyles() {
  return (
    <style>{`
      .pp-card-shell {
        background: linear-gradient(155deg, rgba(18, 24, 42, 0.94) 0%, rgba(8, 10, 20, 0.98) 100%);
      }
      .pp-hero-shell {
        box-shadow:
          0 0 0 1px rgba(231,201,122,0.18),
          0 12px 32px -14px rgba(0,0,0,0.75),
          0 0 28px rgba(110,181,240,0.08);
      }
    `}</style>
  );
}

export function PlatformSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-2 mt-1 px-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em]"
      style={{ color: `${PP_GOLD}99` }}
    >
      {children}
    </p>
  );
}

/** Simple stats strip (sub-screens). */
export function PlatformStatsBar({
  items,
}: {
  items: { label: string; value: string; color: string }[];
}) {
  return (
    <div
      className="relative mb-3 overflow-hidden rounded-[18px] border"
      style={{
        borderColor: `${PP_GOLD}28`,
        background: "rgba(0,0,0,0.35)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px ${PP_GOLD}12`,
      }}
    >
      <div className="grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: `${MC.panelBorder}` }}>
        {items.map((item) => (
          <div key={item.label} className="px-3 py-3 text-center" style={{ background: "rgba(8,12,24,0.92)" }}>
            <p className="text-[9px] font-bold text-slate-500">{item.label}</p>
            <p className="mt-1 font-mono text-[18px] font-extrabold tabular-nums" style={{ color: item.color }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformDashboardPanel({
  healthScore,
  items,
  loading = false,
}: {
  healthScore: number;
  items: { label: string; value: string; color: string }[];
  loading?: boolean;
}) {
  const [sync, setSync] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  );

  useEffect(() => {
    const t = window.setInterval(() => {
      setSync(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div
      className="relative mb-3 overflow-hidden rounded-[18px] border"
      style={{
        borderColor: `${PP_GOLD}30`,
        background: "linear-gradient(160deg, rgba(14,20,36,0.96) 0%, rgba(6,8,16,0.98) 100%)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 0 28px ${PP_GOLD}10`,
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-3.5 py-2.5"
        style={{ borderColor: `${MC.panelBorder}` }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: MC.green, boxShadow: `0 0 8px ${MC.green}` }} />
          <span className="text-[10px] font-bold" style={{ color: MC.green }}>
            Operational · {healthScore}%
          </span>
        </div>
        <span className="font-mono text-[9px] font-semibold tabular-nums text-slate-500">Sync {sync}</span>
      </div>

      <div className="grid grid-cols-3 gap-px sm:grid-cols-5" style={{ background: MC.panelBorder }}>
        {items.map((item) => (
          <div key={item.label} className="px-2.5 py-3 text-center" style={{ background: "rgba(8,12,24,0.94)" }}>
            <p className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
            <p
              className="mt-1 font-mono text-[22px] font-extrabold tabular-nums leading-none"
              style={{ color: item.color }}
            >
              {loading ? "…" : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformControlHero({ subtitle }: { subtitle?: string }) {
  return (
    <article
      className="pp-hero-shell relative mb-3 h-[96px] w-full overflow-hidden rounded-[20px] border"
      style={{ borderColor: "rgba(231,201,122,0.32)", background: "#030208" }}
    >
      <img
        src={controlCenterBg}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        style={{ opacity: 0.88, filter: "brightness(1.35) contrast(1.05) saturate(0.88)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.78) 55%, rgba(0,0,0,0.92) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[19px]"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 24px rgba(110,181,240,0.06)" }}
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1
          className="text-[18px] font-extrabold leading-tight tracking-[0.04em] sm:text-[20px]"
          style={{ color: PP_GOLD_BRIGHT, textShadow: `0 0 24px ${PP_GOLD}44` }}
        >
          Alpha Control Center
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-[300px] text-[10.5px] font-semibold leading-snug text-white/62">{subtitle}</p>
        ) : null}
      </div>
    </article>
  );
}

type GlowTone = "gold" | "blue";

export function PlatformGlowBtn({
  tone,
  label,
  sublabel,
  glyph,
  icon: Icon,
  onClick,
  className,
  disabled,
  compact,
}: {
  tone: GlowTone;
  label: string;
  sublabel: string;
  glyph: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number; style?: CSSProperties }>;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const isBlue = tone === "blue";
  const iconColor = isBlue ? PP_BLUE : PP_GOLD;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative shrink-0 overflow-hidden rounded-xl border transition active:scale-[0.98] disabled:opacity-45 ${
        compact ? "min-h-[44px] min-w-[108px] px-2.5 py-2" : "min-h-[48px] min-w-0 flex-1 px-2 py-2.5"
      } ${className ?? ""}`}
      style={{
        borderColor: isBlue ? "rgba(100,190,255,0.5)" : `${PP_GOLD}44`,
        background: isBlue
          ? "linear-gradient(180deg, rgba(100,190,255,0.18) 0%, rgba(0,0,0,0.2) 100%)"
          : "linear-gradient(180deg, rgba(240,215,140,0.14) 0%, rgba(0,0,0,0.18) 100%)",
        boxShadow: isBlue
          ? "0 0 12px rgba(80,175,255,0.2)"
          : "0 0 12px rgba(240,215,140,0.16)",
      }}
    >
      <div className={`relative z-[1] flex ${compact ? "flex-row items-center gap-1.5" : "flex-col items-center"} text-center`}>
        <Icon
          aria-hidden
          className={compact ? "h-4 w-4 shrink-0" : "h-5 w-5 shrink-0"}
          strokeWidth={2.35}
          style={{ color: iconColor, filter: `drop-shadow(0 0 6px ${iconColor}88)` }}
        />
        {!compact ? (
          <>
            <span
              aria-hidden
              className="mt-0.5 select-none text-[17px] font-black leading-none"
              style={{ color: PP_GOLD_BRIGHT, textShadow: `0 0 8px ${PP_GOLD}55` }}
            >
              {glyph}
            </span>
            <p className="mt-1 w-full text-[10.5px] leading-tight">
              <span className="font-extrabold" style={{ color: PP_GOLD_BRIGHT }}>
                {label}
              </span>
              <span className="mx-1 text-white/28">·</span>
              <span className="font-medium text-white/52">{sublabel}</span>
            </p>
          </>
        ) : (
          <span className="text-[10px] font-extrabold leading-none" style={{ color: PP_GOLD_BRIGHT }}>
            {label}
          </span>
        )}
      </div>
    </button>
  );
}

export function PlatformActionStrip({
  onSearch,
  onAddLink,
  onCopy,
}: {
  onSearch: () => void;
  onAddLink: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="mt-3 space-y-2">
      <div
        dir="rtl"
        className="flex items-stretch gap-2.5 rounded-xl border px-2.5 py-2"
        style={{
          borderColor: `${PP_GOLD}33`,
          background: "rgba(0,0,0,0.42)",
          backdropFilter: "blur(8px)",
        }}
      >
        <PlatformGlowBtn
          tone="blue"
          glyph="Ⲙ"
          label="Google Maps"
          sublabel="Search"
          icon={MapPin}
          onClick={onSearch}
        />
        <div
          aria-hidden
          className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/35 to-transparent"
        />
        <PlatformGlowBtn
          tone="gold"
          glyph="Ⲁ"
          label="Maps Link"
          sublabel="Save"
          icon={Link2}
          onClick={onAddLink}
        />
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="w-full rounded-xl border px-3 py-2.5 text-[10px] font-extrabold text-white/72 transition active:scale-[0.98]"
        style={{
          borderColor: `${MC.panelBorder}`,
          background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.14) 100%)",
        }}
      >
        نسخ اسم الكنيسة
      </button>
    </div>
  );
}

type ModuleCardVariant = "default" | "slim";

function PlatformCardRow({
  icon: Icon,
  accent,
  title,
  subtitle,
  badge,
}: {
  icon: LucideIcon;
  accent: string;
  title: string;
  subtitle: string;
  badge?: number;
}) {
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border"
        style={{
          borderColor: `${accent}50`,
          background: `${accent}18`,
          boxShadow: `0 0 16px -4px ${accent}66`,
        }}
      >
        <Icon className="h-[19px] w-[19px]" style={{ color: accent }} strokeWidth={2.15} />
      </div>
      <div className="min-w-0 flex-1 text-right" dir="rtl">
        <div className="flex items-center justify-end gap-1.5">
          <h3 className="truncate text-[14px] font-extrabold text-white">{title}</h3>
          {badge != null && badge > 0 ? (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] font-extrabold tabular-nums"
              style={{ background: MC.red, color: MC.white }}
            >
              {badge > 99 ? "99+" : formatPlatformNumber(badge)}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

const PLATFORM_CARD_SHELL =
  "pp-card-shell block w-full overflow-hidden rounded-[18px] border px-3.5 py-3 transition active:scale-[0.985]";

export function PlatformModuleCard({
  to,
  title,
  titleEn,
  subtitle,
  icon,
  accent,
  badge,
  actionLabel: _actionLabel,
  btnTone: _btnTone = "gold",
  variant = "default",
  footerMetrics,
}: {
  to: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  badge?: number;
  actionLabel?: string;
  btnTone?: GlowTone;
  variant?: ModuleCardVariant;
  footerMetrics?: { label: string; value: string }[];
}) {
  const line = titleEn ? `${titleEn} · ${subtitle}` : subtitle;
  const shellStyle = {
    borderColor: `${accent}55`,
    boxShadow: `0 10px 28px -12px rgba(0,0,0,0.65), 0 0 22px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.07)`,
  };

  if (variant === "slim") {
    return (
      <Link to={to as never} className={PLATFORM_CARD_SHELL} style={shellStyle}>
        <PlatformCardRow icon={icon} accent={accent} title={title} subtitle={line} badge={badge} />
        {footerMetrics && footerMetrics.length > 0 ? (
          <div
            className="mt-3 grid gap-px rounded-[10px] border pt-2.5"
            style={{ borderColor: `${MC.panelBorder}`, background: MC.panelBorder, gridTemplateColumns: `repeat(${footerMetrics.length}, minmax(0, 1fr))` }}
          >
            {footerMetrics.map((m) => (
              <div key={m.label} className="px-2 py-2 text-center" style={{ background: "rgba(6,10,20,0.92)" }}>
                <p className="text-[9px] font-bold text-slate-500">{m.label}</p>
                <p className="font-mono text-[18px] font-extrabold tabular-nums" style={{ color: accent }}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </Link>
    );
  }

  return (
    <Link to={to as never} className={PLATFORM_CARD_SHELL} style={shellStyle}>
      <PlatformCardRow icon={icon} accent={accent} title={title} subtitle={line} badge={badge} />
    </Link>
  );
}

export function PlatformEmergencyCard({ to }: { to: string }) {
  return (
    <Link
      to={to as never}
      className={PLATFORM_CARD_SHELL}
      style={{
        borderColor: `${MC.red}55`,
        boxShadow: `0 10px 28px -12px rgba(0,0,0,0.65), 0 0 22px ${MC.red}22, inset 0 1px 0 rgba(255,255,255,0.07)`,
      }}
    >
      <PlatformCardRow
        icon={Siren}
        accent={MC.red}
        title="مركز الطوارئ"
        subtitle="Maintenance · Lockdown"
      />
    </Link>
  );
}
