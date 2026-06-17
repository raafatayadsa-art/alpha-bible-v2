import { type ReactNode, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  type LucideIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  Lock,
  Monitor,
  Moon,
  Search,
  Shield,
  Smartphone,
  Sun,
} from "lucide-react";
import { AlphaIcon3D } from "@/components/controls/AlphaIcon3D";
import { AlphaPremiumIcon } from "@/components/controls/AlphaPremiumIcon";
import { cn } from "@/lib/utils";
import type { SecurityLabelKey } from "./settings-store";
import { getCurrentUser } from "@/features/church/current-user";
import alphaShieldImg from "@/assets/alpha-shield.png";

export function GlassCard({
  children,
  accent = "#b8893a",
  className = "",
}: {
  children: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-[#efe2c4]/90 bg-gradient-to-b from-[#fbf3e1]/96 to-[#f4ead8]/94 backdrop-blur-xl",
        className,
      )}
      style={{
        boxShadow:
          `0 18px 36px -20px rgba(120,80,30,0.5), 0 0 24px -14px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[22px] bg-gradient-to-b from-white/45 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function PremiumSectionCard({
  id,
  title,
  description,
  icon: Icon,
  accent = "#b8893a",
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className={cn("mb-2.5 animate-in fade-in duration-300", isOpen && "mb-3.5")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[22px] border backdrop-blur-xl transition-all duration-300 ease-out",
          isOpen
            ? "border-[#efe2c4]/95 bg-gradient-to-b from-[#fbf3e1]/98 to-[#f4ead8]/96"
            : "border-[#efe2c4]/85 bg-gradient-to-b from-[#fbf3e1]/94 to-[#f4ead8]/92 hover:border-[#efe2c4]",
        )}
        style={{
          boxShadow: isOpen
            ? `0 22px 44px -20px rgba(120,80,30,0.48), 0 0 32px -14px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.9)`
            : `0 14px 30px -22px rgba(120,80,30,0.38), 0 0 20px -16px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.82)`,
        }}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 rounded-t-[22px] bg-gradient-to-b to-transparent transition-all duration-300",
            isOpen ? "h-[58%] from-white/55" : "h-[48%] from-white/42",
          )}
        />
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          className="relative flex w-full items-center gap-3.5 px-4 py-[18px] text-right transition duration-200 hover:bg-white/20 active:scale-[0.985]"
        >
          <AlphaIcon3D color={accent} size={52} isOpen={isOpen}>
            <Icon className="h-[22px] w-[22px]" style={{ color: accent }} strokeWidth={2.4} />
          </AlphaIcon3D>
          <div className="min-w-0 flex-1">
            <h2 className="font-arabic-serif text-[15.5px] font-extrabold leading-snug text-[#2a1f12]">
              {title}
            </h2>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6a543a]">{description}</p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-[#c9a05a] transition-transform duration-300 ease-out",
              isOpen && "rotate-180",
            )}
          />
        </button>
        <div
          className={cn(
            "grid transition-all duration-400 ease-out",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-[#efe2c4]/55 bg-white/10 px-4 pb-4 pt-3 backdrop-blur-sm [&>*:last-child]:mb-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DarkModeToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useTranslation("settings");

  return (
    <div className="mb-3.5 flex items-center justify-between gap-4 rounded-[18px] border border-[#efe2c4]/40 bg-white/40 px-4 py-4 shadow-[0_2px_10px_-4px_rgba(120,80,30,0.08)] backdrop-blur-sm transition-all hover:bg-white/50">
      <div className="min-w-0 flex-1 text-right">
        <p className="text-[13px] font-bold text-[#3a2a18]">{t("darkMode.title")}</p>
        <p className="mt-0.5 text-[11px] text-[#6a543a] leading-snug">
          {checked ? t("darkMode.enabled") : t("darkMode.disabled")}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={t("darkMode.ariaLabel")}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-gradient-to-l from-[#1f6e54] to-[#3eb482]" : "bg-[#d8cdb8]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300",
            checked ? "right-[22px]" : "right-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function LinkCard({
  to,
  icon: Icon,
  title,
  subtitle,
  accent,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-[18px] px-3 py-3 transition hover:bg-white/40 active:scale-[0.99]"
    >
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        style={{
          background: `linear-gradient(145deg, ${accent}44, ${accent}18)`,
          borderColor: `${accent}55`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-[13px] font-bold text-[#3a2a18]">{title}</p>
        <p className="text-[10.5px] text-[#6a543a]">{subtitle}</p>
      </div>
      <ChevronLeft className="h-4 w-4 shrink-0 text-[#b8893a]/70" />
    </Link>
  );
}

/** Full-size settings card row — matches collapsed PremiumSectionCard height and DNA. */
export function PremiumLinkCard({
  to,
  icon: Icon,
  title,
  subtitle,
  accent = "#3f9d6e",
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accent?: string;
}) {
  return (
    <div className="mb-2.5 animate-in fade-in duration-300">
      <Link
        to={to}
        className={cn(
          "relative flex w-full items-center gap-3.5 overflow-hidden rounded-[22px] border border-[#efe2c4]/85 bg-gradient-to-b from-[#fbf3e1]/94 to-[#f4ead8]/92 px-4 py-[18px] text-right backdrop-blur-xl transition-all duration-300 ease-out",
          "hover:border-[#efe2c4] active:scale-[0.985]",
        )}
        style={{
          boxShadow: `0 14px 30px -22px rgba(120,80,30,0.38), 0 0 20px -16px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.82)`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[48%] rounded-t-[22px] bg-gradient-to-b from-white/42 to-transparent"
        />
        <AlphaIcon3D color={accent} size={52} isOpen={false}>
          <Icon className="h-[22px] w-[22px]" style={{ color: accent }} strokeWidth={2.4} />
        </AlphaIcon3D>
        <div className="relative min-w-0 flex-1">
          <h2 className="font-arabic-serif text-[15.5px] font-extrabold leading-snug text-[#2a1f12]">
            {title}
          </h2>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6a543a]">{subtitle}</p>
        </div>
        <ChevronLeft className="relative h-5 w-5 shrink-0 text-[#c9a05a]" />
      </Link>
    </div>
  );
}

export function ToggleRow({
  label,
  subtitle,
  checked,
  onChange,
}: {
  label: string;
  subtitle?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-4 rounded-[18px] border border-[#efe2c4]/40 bg-white/40 px-4 py-4 shadow-[0_2px_10px_-4px_rgba(120,80,30,0.08)] backdrop-blur-sm transition-all hover:bg-white/50">
      <div className="min-w-0 flex-1 text-right">
        <p className="text-[13px] font-bold text-[#3a2a18]">{label}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-[#6a543a] leading-snug">{subtitle}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-gradient-to-l from-[#1f6e54] to-[#3eb482]" : "bg-[#d8cdb8]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300",
            checked ? "right-[22px]" : "right-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3.5 rounded-[18px] border border-[#efe2c4]/40 bg-white/40 px-4 py-4 shadow-[0_2px_10px_-4px_rgba(120,80,30,0.08)] backdrop-blur-sm transition-all hover:bg-white/50">
      <p className="mb-3 text-right text-[13px] font-bold text-[#3a2a18]">{label}</p>
      <div className="flex flex-wrap justify-end gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-xl px-3 py-2 text-[11px] font-bold transition active:scale-95",
              value === o.value
                ? "bg-gradient-to-l from-[#1f6e54] to-[#3eb482] text-white shadow-sm"
                : "border border-[#efe2c4] bg-white/60 text-[#6a543a]",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActionRow({ label, subtitle, onClick, danger }: {
  label: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3.5 flex w-full items-center justify-between gap-4 rounded-[18px] border border-[#efe2c4]/40 bg-white/40 px-4 py-4 text-right shadow-[0_2px_10px_-4px_rgba(120,80,30,0.08)] backdrop-blur-sm transition-all hover:bg-white/50 active:scale-[0.99]"
    >
      <div className="flex-1">
        <p className={cn("text-[13px] font-bold", danger ? "text-[#EF4444]" : "text-[#3a2a18]")}>{label}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-[#6a543a] leading-snug">{subtitle}</p>}
      </div>
      <ChevronLeft className="h-5 w-5 shrink-0 text-[#b8893a]/60" />
    </button>
  );
}

export function SettingsSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation("settings");

  return (
    <div className="relative mb-4">
      <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7e5a]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-2xl border border-[#efe2c4]/90 bg-white/65 py-2.5 pe-10 ps-3 text-[13px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#4fd4a8]/50 focus:ring-2 focus:ring-[#4fd4a8]/20"
      />
    </div>
  );
}

export function Divider() {
  return <div className="mx-3 h-px bg-[#efe2c4]/70" />;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3.5 mt-2 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#efe2c4]/70" />
      <p className="text-[11.5px] font-extrabold tracking-wide text-[#b8893a]">{children}</p>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#efe2c4]/70" />
    </div>
  );
}

function PremiumShieldArc({ score, color = "#3f9d6e" }: { score: number; color?: string }) {
  const R = 34; // Smaller radius
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  return (
    <div className="relative mx-auto shrink-0" style={{ width: 76, height: 76 }}>
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${color}35, transparent 60%)`,
          filter: "blur(12px)",
          transform: "scale(1.3)",
        }}
      />
      {/* Progress arc SVG */}
      <svg viewBox="0 0 76 76" className="absolute inset-0 h-full w-full" fill="none">
        <defs>
          <linearGradient id="arcFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx="38" cy="38" r={R} stroke={`${color}18`} strokeWidth="3.5" strokeLinecap="round" />
        {/* Progress */}
        <circle
          cx="38"
          cy="38"
          r={R}
          stroke="url(#arcFill)"
          strokeWidth="3.5"
          strokeDasharray={`${dash} ${C}`}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
        />
      </svg>

      {/* Shield container — Image */}
      <div
        className="absolute grid place-items-center overflow-hidden rounded-full"
        style={{
          inset: 7,
          background: "#fff",
          border: `1.5px solid ${color}50`,
          boxShadow: `inset 0 2px 4px rgba(0,0,0,0.08), 0 6px 16px -4px ${color}80`,
        }}
      >
        <img 
          src={alphaShieldImg} 
          alt="Shield" 
          className="h-[140%] w-[140%] object-cover"
          style={{ objectPosition: "center 15%" }} 
        />
        {/* Inner glass overlay */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6)",
          }}
        />
      </div>
    </div>
  );
}

function HeroStatChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 rounded-[18px] px-1.5 py-2.5 backdrop-blur-md transition-transform hover:scale-[1.02]"
      style={{
        background: "linear-gradient(165deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 100%)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,1), 0 6px 16px -4px rgba(120,80,30,0.12)",
      }}
    >
      {/* 3D icon */}
      <div
        className="relative grid h-[32px] w-[32px] shrink-0 place-items-center overflow-hidden"
        style={{
          borderRadius: 11,
          background: `radial-gradient(130% 100% at 30% 20%, ${accent}88, ${accent}22 75%)`,
          border: `1px solid ${accent}55`,
          boxShadow: `inset 0 2px 2px rgba(255,255,255,0.8), inset 0 -4px 8px ${accent}40, 0 6px 12px -4px ${accent}90`,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/2"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.65), transparent)" }}
        />
        <Icon className="relative h-4 w-4" style={{ color: accent, filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))" }} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col items-center w-full">
        <span className="w-full truncate text-center font-arabic-serif text-[11px] font-extrabold leading-tight text-[#2a1f12]">
          {value}
        </span>
        <span className="font-arabic-serif text-center text-[9px] font-bold text-[#8a6a3a]">{label}</span>
      </div>
    </div>
  );
}

export function ControlCenterHero({
  score,
  scoreLabelKey,
  devicesCount = 1,
}: {
  score: number;
  scoreLabelKey: SecurityLabelKey;
  devicesCount?: number;
}) {
  const { t } = useTranslation("settings");
  const user = getCurrentUser();

  const protectionKeyMap: Record<SecurityLabelKey, string> = {
    excellent: "security.protectionExcellent",
    veryGood: "security.protectionVeryGood",
    good: "security.protectionGood",
    needsImprovement: "security.protectionNeedsImprovement",
  };
  const badgeText = t(protectionKeyMap[scoreLabelKey]);
  const scoreColor = score >= 80 ? "#1f6e54" : score >= 55 ? "#c98a3c" : "#c14545";

  return (
    <div
      className="relative mb-3 overflow-hidden rounded-[22px] animate-in fade-in slide-in-from-bottom-2 duration-400"
      style={{
        background: "linear-gradient(160deg, #fcf6ea 0%, #f6edd9 50%, #ede2cb 100%)",
        border: "1px solid rgba(239,226,196,0.95)",
        boxShadow:
          "0 18px 40px -16px rgba(100,60,20,0.45), 0 0 30px -15px rgba(63,157,110,0.15), inset 0 1px 0 rgba(255,255,255,0.94)",
      }}
    >
      {/* Layered ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% -5%, rgba(216,168,58,0.18), transparent 58%)," +
            "radial-gradient(50% 55% at 50% 108%, rgba(63,157,110,0.12), transparent 62%)," +
            "radial-gradient(35% 38% at 96% 4%, rgba(216,168,58,0.1), transparent 55%)",
        }}
      />
      {/* Top inner shine */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[48%] rounded-t-[22px]"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5), transparent)" }}
      />

      <div className="relative px-3 pt-3 pb-3.5">

        {/* ── Identity bar ── */}
        <div className="mb-2 flex items-center gap-2.5">
          <div className="relative shrink-0">
            <img
              src={user.avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
              style={{
                border: "1.5px solid rgba(216,168,58,0.55)",
                boxShadow: "0 3px 8px rgba(120,80,30,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            />
            <div
              className="absolute -bottom-0.5 -right-0.5 h-[10px] w-[10px] rounded-full bg-[#3eb482]"
              style={{ border: "1.5px solid #f6edd9", boxShadow: "0 2px 5px rgba(63,180,130,0.4)" }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#a67c32]">
              Alpha · Control Center
            </p>
            <p className="mt-0.5 truncate font-arabic-serif text-[13.5px] font-extrabold leading-tight text-[#2a1f12]">
              {user.name || "مستخدم Alpha"}
            </p>
          </div>
          <div
            className="shrink-0 rounded-full px-2.5 py-1 flex items-center gap-1"
            style={{
              background: "linear-gradient(160deg, #d8a83a 0%, #b8893a 100%)",
              border: "1px solid #e7c97a",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6), 0 4px 10px -2px rgba(184,137,58,0.5)",
            }}
          >
            <span className="text-[9.5px] font-extrabold text-white drop-shadow-sm">عضو Alpha</span>
          </div>
        </div>

        {/* Gold divider */}
        <div
          className="mb-2.5 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(216,168,58,0.3), transparent)" }}
        />

        {/* ── Premium Shield + Title ── */}
        <div className="mb-2.5 flex items-center gap-3">
          <PremiumShieldArc score={score} color="#3f9d6e" />

          <div className="min-w-0 flex-1">
            <h1
              className="font-arabic-serif text-[19px] font-extrabold leading-[1.2]"
              style={{
                backgroundImage: "linear-gradient(135deg, #6b21a8 0%, #9333ea 50%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {t("hero.title")}
            </h1>

            {/* Badge inline under title */}
            <div
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-1 backdrop-blur-sm"
              style={{
                background: "linear-gradient(160deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,1), 0 3px 8px -4px rgba(63,157,110,0.25)`,
              }}
            >
              <span className="font-arabic-serif text-[10.5px] font-bold text-[#2a1f12]">{badgeText}</span>
              <span
                className="font-arabic-serif text-[11px] font-extrabold tabular-nums"
                style={{ color: scoreColor }}
              >
                {score}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Glassy stat chips ── */}
        <div className="grid grid-cols-3 gap-1.5">
          <HeroStatChip
            icon={Smartphone}
            label={t("hero.statsDevices")}
            value={String(devicesCount)}
            accent="#5b8fd1"
          />
          <HeroStatChip
            icon={Shield}
            label={t("hero.statsProtection")}
            value={t(`security.${scoreLabelKey}`)}
            accent="#3f9d6e"
          />
          <HeroStatChip
            icon={Lock}
            label={t("hero.statsPrivacy")}
            value={t("hero.statsPrivacyValue")}
            accent="#8a6ec1"
          />
        </div>
      </div>
    </div>
  );
}

export function LogoutButton({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation("common");

  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 w-full grid place-items-center rounded-2xl border border-[#e8b4b4]/60 bg-gradient-to-l from-[#c14545] to-[#d86a6a] py-3.5 font-extrabold text-[#fdf8f0] shadow-[0_10px_24px_-12px_rgba(193,69,69,0.55)] backdrop-blur-sm transition active:scale-[0.98]"
    >
      {t("actions.logout")}
    </button>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="px-3 py-2">
      <label className="mb-1.5 block text-right text-[11.5px] font-bold text-[#3a2a18]">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-[#efe2c4]/90 bg-white/65 px-3 py-2.5 text-[13px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#3f9d6e]/50 focus:ring-2 focus:ring-[#3f9d6e]/15"
      />
    </div>
  );
}

export function PasswordChangeForm({
  onSubmit,
}: {
  onSubmit?: (data: { current: string; next: string }) => void | Promise<void>;
}) {
  const { t } = useTranslation("settings");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);
    if (!current.trim() || !next.trim() || !confirm.trim()) {
      setError(t("password.errors.fillAll"));
      return;
    }
    if (next !== confirm) {
      setError(t("password.errors.mismatch"));
      return;
    }
    if (next.length < 8) {
      setError(t("password.errors.tooShort"));
      return;
    }
    setLoading(true);
    try {
      await onSubmit?.({ current, next });
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError(t("password.errors.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-1.5 my-1 rounded-[18px] border border-[#efe2c4]/70 bg-white/25 p-1 backdrop-blur-sm">
      <p className="px-3 pt-2.5 text-start text-[12px] font-extrabold text-[#2a1f12]">{t("password.title")}</p>
      <p className="px-3 pb-1 text-start text-[10px] text-[#6a543a]">{t("password.lastUpdated")}</p>
      <PasswordField
        label={t("password.current")}
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
      />
      <PasswordField
        label={t("password.new")}
        value={next}
        onChange={setNext}
        autoComplete="new-password"
      />
      <PasswordField
        label={t("password.confirm")}
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />
      {error && (
        <p className="px-3 pb-1 text-start text-[10.5px] font-bold text-[#EF4444]">{error}</p>
      )}
      {success && (
        <p className="px-3 pb-1 text-start text-[10.5px] font-bold text-[#1f6e54]">
          {t("passwordUpdated", { ns: "notifications" })}
        </p>
      )}
      <div className="px-3 py-2.5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-l from-[#1f6e54] to-[#3eb482] py-2.5 text-[12.5px] font-extrabold text-[#fdf8f0] shadow-[0_8px_20px_-10px_rgba(31,110,84,0.55)] transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? t("password.submitting") : t("password.submit")}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_ACTIVE_SESSIONS = [
  { id: "iphone", current: true },
  { id: "web", current: false },
] as const;

export function ActiveSessionsList({
  sessions = DEFAULT_ACTIVE_SESSIONS,
}: {
  sessions?: readonly { id: string; current: boolean }[];
}) {
  const { t } = useTranslation(["settings", "common"]);

  return (
    <div className="space-y-1 px-1.5 py-1">
      {sessions.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 rounded-[16px] px-3 py-2.5"
        >
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            style={{
              background: "linear-gradient(145deg, #4a86c144, #4a86c118)",
              borderColor: "#4a86c155",
            }}
          >
            <Smartphone className="h-4.5 w-4.5 text-[#4a86c1]" />
          </div>
          <div className="min-w-0 flex-1 text-start">
            <p className="text-[12.5px] font-bold text-[#3a2a18]">
              {t(`sessions.${s.id}.device`, { ns: "settings" })}
            </p>
            <p className="text-[10px] text-[#6a543a]">
              {t(`sessions.${s.id}.detail`, { ns: "settings" })}
            </p>
          </div>
          {s.current && (
            <span className="shrink-0 rounded-full bg-[#3f9d6e]/15 px-2 py-0.5 text-[9px] font-extrabold text-[#1f6e54]">
              {t("actions.active", { ns: "common" })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const THEME_OPTION_IDS = ["light", "dark", "system"] as const;

export function ThemeModePicker({
  value,
  onChange,
}: {
  value: "light" | "dark" | "system";
  onChange: (v: "light" | "dark" | "system") => void;
}) {
  const { t } = useTranslation("settings");
  const themeOptions = useMemo(
    () =>
      THEME_OPTION_IDS.map((id) => ({
        id,
        label: t(`darkMode.${id}`),
        sub: t(`darkMode.${id}Sub`),
        icon: id === "light" ? Sun : id === "dark" ? Moon : Monitor,
      })),
    [t],
  );

  return (
    <div className="space-y-1 px-1.5 py-1">
      {themeOptions.map((o) => {
        const active = value === o.id;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-[18px] px-3 py-3 transition hover:bg-white/40 active:scale-[0.99]",
              active && "bg-white/45",
            )}
          >
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              style={{
                background: active
                  ? "linear-gradient(145deg, #d8a83a44, #d8a83a18)"
                  : "linear-gradient(145deg, #d8a83a22, #d8a83a0a)",
                borderColor: active ? "#d8a83a88" : "#d8a83a44",
              }}
            >
              <Icon className="h-5 w-5 text-[#8a5a14]" />
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[13px] font-bold text-[#3a2a18]">{o.label}</p>
              <p className="text-[10.5px] text-[#6a543a]">{o.sub}</p>
            </div>
            {active && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d8a83a] text-white shadow-sm">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
