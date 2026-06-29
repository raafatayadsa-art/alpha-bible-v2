import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  ChevronLeft,
  Church,
  FileText,
  ClipboardList,
  Cpu,
  LayoutDashboard,
  Lock,
  MapPin,
  Mountain,
  Scan,
  RefreshCw,
  Settings,
  Shield,
  Siren,
  User,
  Users,
  Home,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MC } from "./platform-store";
import { syncPlatformControlAll, subscribePlatformSync } from "./platform-control-sync";

const GRID_BG = {
  backgroundColor: MC.bg,
  backgroundImage: `
    radial-gradient(ellipse 100% 45% at 50% -8%, rgba(52, 199, 89, 0.08), transparent 55%),
    linear-gradient(180deg, ${MC.bg} 0%, ${MC.bg} 100%)
  `,
};

function luxuryShadow(_accent?: string) {
  return `0 4px 20px -8px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)`;
}

export function CyberPanel({
  children,
  className = "",
  glow = MC.purple,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[16px] border backdrop-blur-md", padding && "p-3.5", className)}
      style={{
        background: MC.panel,
        borderColor: MC.panelBorder,
        boxShadow: luxuryShadow(glow),
      }}
    >
      {children}
    </div>
  );
}

function LiveDot({ color = MC.green, pulse = false }: { color?: string; pulse?: boolean }) {
  return (
    <span className="relative flex h-1.5 w-1.5">
      {pulse && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-30" style={{ background: color }} />
      )}
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

export function MissionHeader({ alertCount = 0 }: { alertCount?: number }) {
  const navigate = useNavigate();

  return (
    <header className="mb-2 pt-[max(env(safe-area-inset-top),6px)]">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => navigate({ to: "/platform/approvals" })}
          className="relative grid h-10 w-10 place-items-center rounded-[12px] border active:scale-95"
          style={{
            borderColor: `${MC.green}44`,
            background: MC.panel,
          }}
        >
          <Bell className="h-[18px] w-[18px]" style={{ color: MC.green }} strokeWidth={2} />
          {alertCount > 0 ? (
            <span
              className="absolute -left-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-0.5 font-mono text-[8px] font-bold tabular-nums"
              style={{ background: MC.red, color: MC.white }}
            >
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          ) : null}
        </button>
        <p className="text-[10px] font-bold text-slate-500">Owner Access</p>
      </div>
    </header>
  );
}

export function LuxuryCommandCard({
  to,
  title,
  titleEn,
  subtitle,
  icon: Icon,
  accent,
  badge,
  actionLabel,
  size = "large",
}: {
  to: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  accent: string;
  badge?: number;
  actionLabel: string;
  size?: "large" | "medium" | "compact";
}) {
  const heights = { large: "min-h-[148px]", medium: "min-h-[120px]", compact: "min-h-[108px]" };
  const iconSizes = { large: "h-11 w-11", medium: "h-10 w-10", compact: "h-9 w-9" };
  const glyphSizes = { large: "h-5 w-5", medium: "h-[18px] w-[18px]", compact: "h-4 w-4" };
  const titleSizes = { large: "text-[12px]", medium: "text-[11px]", compact: "text-[10px]" };

  return (
    <Link to={to as "/"} className="block transition-transform active:scale-[0.98]">
      <CyberPanel glow={accent} padding={false} className={cn("relative flex h-full flex-col", heights[size])}>
        {badge != null && badge > 0 && (
          <span
            className="absolute left-2 top-2 z-10 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[9px] font-bold"
            style={{ background: MC.red, color: MC.white }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
        <div className="flex flex-1 flex-col p-3">
          <div
            className={cn("mb-2 grid place-items-center rounded-[14px] border", iconSizes[size])}
            style={{ borderColor: `${accent}33`, background: `${accent}18`, boxShadow: `0 0 20px -8px ${accent}66` }}
          >
            <Icon className={glyphSizes[size]} style={{ color: accent }} strokeWidth={2} />
          </div>
          <h3 className={cn("font-extrabold leading-tight", titleSizes[size])} style={{ color: MC.white }}>
            {title}
          </h3>
          {titleEn && size !== "compact" && (
            <p className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: MC.muted }}>
              {titleEn}
            </p>
          )}
          <p className={cn("mt-1 flex-1 leading-snug", size === "compact" ? "text-[8px]" : "text-[9px]")} style={{ color: MC.muted }}>
            {subtitle}
          </p>
          <p className="mt-2 text-[9px] font-bold" style={{ color: accent }}>
            {actionLabel} ←
          </p>
        </div>
      </CyberPanel>
    </Link>
  );
}

/** @deprecated use LuxuryCommandCard */ export const CommandCard = LuxuryCommandCard;

export function ImportantAlertsBar({
  churches,
  priests,
  reports,
  saints,
}: {
  churches: number;
  priests: number;
  reports: number;
  saints: number;
}) {
  const items = [
    { label: "كنائس", value: churches, color: MC.red },
    { label: "كهنة", value: priests, color: MC.amber },
    { label: "بلاغات", value: reports, color: MC.red },
    { label: "صور", value: saints, color: MC.gold },
  ];

  return (
    <CyberPanel glow={MC.red} className="mb-2.5 !p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Siren className="h-3.5 w-3.5 text-[#b85450]" />
        <p className="text-[10px] font-bold text-slate-200">تنبيهات مهمة</p>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {items.map((i) => (
          <div key={i.label} className="rounded-[6px] border px-0.5 py-1 text-center" style={{ borderColor: `${i.color}28` }}>
            <p className="font-mono text-[13px] font-extrabold tabular-nums" style={{ color: i.color }}>
              {i.value}
            </p>
            <p className="text-[7px] font-semibold text-slate-500">{i.label}</p>
          </div>
        ))}
      </div>
    </CyberPanel>
  );
}

export function EmergencyBanner({ to }: { to: string }) {
  return (
    <Link to={to as "/"} className="mb-2 block">
      <div
        className="overflow-hidden rounded-[16px] border active:scale-[0.99]"
        style={{
          borderColor: `${MC.red}44`,
          background: MC.panel,
        }}
      >
        <div className="flex items-center gap-3 p-3.5">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border"
            style={{ borderColor: `${MC.red}44`, background: `${MC.red}18` }}
          >
            <Siren className="h-6 w-6" style={{ color: MC.red }} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-extrabold" style={{ color: MC.white }}>
              مركز الطوارئ
            </p>
            <p className="text-[9px] leading-snug" style={{ color: MC.muted }}>
              إدارة الحالات الحرجة وإجراءات الطوارئ · Maintenance · Lockdown
            </p>
          </div>
          <span className="shrink-0 rounded-[10px] border px-2.5 py-1.5 text-[9px] font-bold" style={{ borderColor: `${MC.red}55`, color: MC.red }}>
            فتح ←
          </span>
        </div>
      </div>
    </Link>
  );
}

export type OwnerToolbarActive = "home" | "approvals" | "scan" | "alerts" | "sync";

export function OwnerToolbar({
  active: activeProp,
  badges = {},
}: {
  active?: OwnerToolbarActive;
  badges?: { approvals?: number; alerts?: number };
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname.replace(/\/+$/, "") || "/" });

  const activeFromPath = useMemo((): OwnerToolbarActive => {
    if (pathname === "/platform" || pathname === "/platform/") return "home";
    if (pathname.startsWith("/platform/approvals")) return "approvals";
    if (pathname.startsWith("/platform/scan")) return "scan";
    return "home";
  }, [pathname]);

  const active = activeProp ?? activeFromPath;
  const [syncing, setSyncing] = useState(false);
  const [syncFlash, setSyncFlash] = useState(false);

  useEffect(() => subscribePlatformSync(() => setSyncFlash(true)), []);

  useEffect(() => {
    if (!syncFlash) return;
    const t = window.setTimeout(() => setSyncFlash(false), 1200);
    return () => window.clearTimeout(t);
  }, [syncFlash]);

  const runSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await syncPlatformControlAll();
      setSyncFlash(true);
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  function ToolbarLink({
    id,
    label,
    icon: Icon,
    to,
    badge,
    accent,
  }: {
    id: OwnerToolbarActive;
    label: string;
    icon: typeof LayoutDashboard;
    to: string;
    badge?: number;
    accent?: string;
  }) {
    const on = active === id;
    const color = on ? MC.green : MC.muted;
    return (
      <Link
        to={to as "/platform"}
        preload="intent"
        className={cn(
          "relative flex flex-1 flex-col items-center gap-1 rounded-[14px] py-2 touch-manipulation transition",
          on && "bg-[#34C759]/14",
        )}
      >
        {badge != null && badge > 0 && (
          <span
            className="absolute -top-0.5 left-1/2 z-10 grid h-5 min-w-5 -translate-x-1/2 place-items-center rounded-full px-0.5 font-mono text-[8px] font-bold tabular-nums"
            style={{ background: MC.red, color: MC.white }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
        <Icon className="h-7 w-7" style={{ color }} strokeWidth={2} />
        <span className="text-[11px] font-bold" style={{ color }}>
          {label}
        </span>
        {on ? (
          <span
            className="absolute -bottom-0.5 h-1 w-8 rounded-full"
            style={{ background: MC.green, boxShadow: `0 0 8px ${MC.greenBright}` }}
          />
        ) : null}
      </Link>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-xl"
      style={{ borderColor: MC.panelBorder, background: "rgba(0, 0, 0, 0.92)" }}
    >
      <div
        dir="ltr"
        className="mx-auto grid max-w-lg grid-cols-5 items-end gap-1 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3"
      >
        <ToolbarLink id="home" label="لوحة التحكم" icon={LayoutDashboard} to="/platform" />
        <button
          type="button"
          onClick={() => void runSync()}
          disabled={syncing}
          className="relative flex flex-1 flex-col items-center gap-1 py-2 touch-manipulation disabled:opacity-60"
        >
          <RefreshCw
            className={cn("h-7 w-7", syncing && "animate-spin")}
            style={{ color: syncFlash ? MC.green : active === "sync" ? MC.green : MC.muted }}
            strokeWidth={2}
          />
          <span
            className="text-[11px] font-bold"
            style={{ color: syncFlash ? MC.green : active === "sync" ? MC.green : MC.muted }}
          >
            {syncing ? "مزامنة…" : "مزامنة"}
          </span>
          {syncFlash ? (
            <span
              className="absolute -bottom-0.5 h-1 w-8 rounded-full"
              style={{ background: MC.green, boxShadow: `0 0 8px ${MC.green}` }}
            />
          ) : null}
        </button>
        <ToolbarLink id="scan" label="Scan" icon={Scan} to="/platform/scan" accent={MC.purple} />
        <ToolbarLink
          id="approvals"
          label="الموافقات"
          icon={Shield}
          to="/platform/approvals"
          badge={badges.approvals}
        />
        <Link
          to="/home"
          preload="intent"
          className="relative flex flex-1 flex-col items-center gap-1 py-2 touch-manipulation"
        >
          <Home className="h-7 w-7" style={{ color: MC.muted }} strokeWidth={2} />
          <span className="text-[11px] font-bold" style={{ color: MC.muted }}>
            Alpha
          </span>
        </Link>
      </div>
    </nav>
  );
}

/** @deprecated use OwnerToolbar */ export const MissionBottomNav = OwnerToolbar;

function mapNavToToolbar(nav?: "dashboard" | "quick" | "alerts" | "profile"): OwnerToolbarActive {
  if (nav === "quick") return "scan";
  if (nav === "alerts") return "approvals";
  if (nav === "profile") return "sync";
  return "home";
}

export function MissionControlShell({
  children,
  showNav = true,
  navActive = "dashboard",
  toolbarActive,
  toolbarBadges,
}: {
  children: ReactNode;
  showNav?: boolean;
  navActive?: "dashboard" | "quick" | "alerts" | "profile";
  toolbarActive?: OwnerToolbarActive;
  toolbarBadges?: { approvals?: number; alerts?: number };
}) {
  const active = toolbarActive ?? mapNavToToolbar(navActive);

  return (
    <div dir="rtl" className="min-h-screen text-[15px] leading-relaxed" style={{ ...GRID_BG, color: MC.text }}>
      <div className="mx-auto w-full max-w-lg px-2.5 pb-32 pt-1 sm:px-3">
        {children}
      </div>
      {showNav && <OwnerToolbar active={active} badges={toolbarBadges} />}
    </div>
  );
}

/** Reads TanStack Router's navigation index from browser history state. */
function getHistoryIdx(): number {
  if (typeof window === "undefined") return 0;
  return ((window.history.state as Record<string, unknown>)?.idx as number) ?? 0;
}

/** Navigate back in Alpha Control — preserves browser history when possible. */
export function usePlatformBack(fallbackTo = "/platform") {
  const router = useRouter();
  return useCallback(() => {
    if (getHistoryIdx() > 0) {
      router.history.back();
      return;
    }
    router.navigate({ to: fallbackTo });
  }, [router, fallbackTo]);
}

export function MissionSubShell({
  title,
  titleEn,
  children,
  navActive,
}: {
  title: string;
  titleEn?: string;
  children: ReactNode;
  navActive?: "dashboard" | "quick" | "alerts" | "profile";
}) {
  const goBack = usePlatformBack("/platform");
  return (
    <MissionControlShell showNav navActive={navActive}>
      <div className="mb-3 flex items-center gap-2 pt-[max(env(safe-area-inset-top),8px)]">
        <button
          type="button"
          aria-label="رجوع"
          onClick={goBack}
          className="grid h-10 w-10 place-items-center rounded border"
          style={{ borderColor: MC.panelBorder, background: MC.panel }}
        >
          <ChevronLeft className="h-5 w-5 rotate-180 text-slate-400" />
        </button>
        <div>
          <h1 className="text-[17px] font-extrabold text-white">{title}</h1>
          {titleEn && <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{titleEn}</p>}
        </div>
      </div>
      {children}
    </MissionControlShell>
  );
}

export function PrivacyStrip({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-3 flex items-start gap-2 rounded border px-2.5 py-2.5 text-[12px] font-bold leading-relaxed"
      style={{ borderColor: `${MC.green}33`, background: `${MC.green}14`, color: MC.greenBright }}
    >
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function CyberSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mb-3 w-full rounded-lg border bg-[#1C1C1E] px-3 py-3 text-[14px] font-bold text-white placeholder:text-[#8E8E93] outline-none focus:border-[#34C759]/50"
      style={{ borderColor: MC.panelBorder }}
    />
  );
}

export function CyberFilterChip({
  label,
  active,
  onClick,
  size = "md",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border font-extrabold transition active:scale-95",
        lg ? "px-5 py-2.5 text-[16px]" : "px-3.5 py-2 text-[13px]",
        active ? "border-[#34C759]/50 bg-[#34C759] text-black" : "border-[#3A3A3C] bg-[#1C1C1E] text-[#8E8E93]",
      )}
    >
      {label}
    </button>
  );
}

export function CyberBtn({
  label,
  onClick,
  variant = "primary",
  className,
  disabled,
  highlight,
}: {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "danger" | "ghost" | "warn" | "save";
  className?: string;
  disabled?: boolean;
  highlight?: boolean;
}) {
  const styles = {
    primary: { border: `${MC.green}55`, background: `${MC.green}18`, color: MC.green },
    danger: { border: `${MC.red}44`, background: `${MC.red}14`, color: MC.red },
    ghost: { border: MC.panelBorder, background: MC.panel, color: MC.text },
    warn: { border: `${MC.amber}44`, background: `${MC.amber}14`, color: MC.amber },
    save: {
      border: `${MC.green}88`,
      background: MC.green,
      color: "#000000",
      boxShadow: `0 0 20px -4px ${MC.greenBright}`,
    },
  };
  const s = highlight && !disabled ? styles.save : styles[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-h-[48px] rounded-lg border px-3 py-2.5 text-[13px] font-extrabold transition active:scale-[0.98] disabled:opacity-40",
        highlight && !disabled && "animate-pulse",
        className,
      )}
      style={s}
    >
      {label}
    </button>
  );
}

export function CyberToggle({
  label,
  checked,
  onChange,
  disabled,
  size = "default",
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  size?: "default" | "large";
}) {
  const large = size === "large";
  return (
    <div
      dir="rtl"
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border",
        large ? "px-4 py-3.5" : "px-3 py-2.5",
        disabled && "opacity-55",
      )}
      style={{ borderColor: MC.panelBorder, background: MC.panel }}
    >
      <span
        className={cn(
          "min-w-0 flex-1 text-right font-bold leading-snug text-slate-200",
          large ? "text-[15px]" : "text-[12px]",
        )}
      >
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        dir="ltr"
        className={cn(
          "relative shrink-0 rounded-full border transition active:scale-95 disabled:pointer-events-none",
          large ? "h-8 w-14" : "h-7 w-12",
          checked ? "border-emerald-500/60 bg-emerald-500/30" : "border-slate-600 bg-slate-800",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 rounded-full bg-white shadow transition-[left]",
            large ? "h-6 w-6" : "h-5 w-5",
            checked ? (large ? "left-[26px]" : "left-[22px]") : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function ModuleControlRow({
  labelAr,
  labelEn,
  scopeAr,
  checked,
  onChange,
  disabled,
  icon: Icon,
  accent,
  metricValue,
}: {
  labelAr: string;
  labelEn: string;
  scopeAr?: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  icon: typeof Box;
  accent: string;
  metricValue?: string;
}) {
  const isToggle = metricValue == null && onChange != null;
  const isOn = isToggle ? checked === true : true;

  return (
    <div
      dir="rtl"
      className={cn(
        "overflow-hidden rounded-[18px] border transition",
        disabled && "opacity-55",
        isToggle && !checked && "opacity-80",
      )}
      style={{
        borderColor: isOn ? MC.panelBorder : MC.panelBorder,
        background: isOn ? MC.panel : "rgba(28,28,30,0.6)",
      }}
    >
      <div className="flex items-start gap-3 px-4 py-4">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border"
          style={{
            borderColor: `${accent}33`,
            background: `${accent}18`,
          }}
        >
          <Icon className="h-6 w-6" style={{ color: accent }} strokeWidth={2.1} />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isToggle ? (
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold",
                  checked ? "border-[#34C759]/40 text-[#34C759]" : "border-[#3A3A3C] text-[#8E8E93]",
                )}
              >
                {checked ? "مفعّل" : "موقوف"}
              </span>
            ) : null}
            <h3 className="text-[17px] font-extrabold leading-tight text-slate-50">{labelAr}</h3>
          </div>
          <p className="mt-0.5 text-[13px] font-semibold text-slate-400">{labelEn}</p>
          {scopeAr ? (
            <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-500">{scopeAr}</p>
          ) : null}
        </div>
        {metricValue != null ? (
          <span
            className="mt-1 shrink-0 rounded-[12px] border px-3 py-2 text-[16px] font-extrabold tabular-nums text-slate-100"
            style={{ borderColor: `${accent}44`, background: `${accent}14` }}
          >
            {metricValue}
          </span>
        ) : isToggle ? (
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={`${labelAr} — ${checked ? "إيقاف" : "تشغيل"}`}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            dir="ltr"
            className={cn(
              "relative mt-1 h-8 w-14 shrink-0 rounded-full border transition active:scale-95 disabled:pointer-events-none",
              checked ? "border-emerald-500/60 bg-emerald-500/30" : "border-slate-600 bg-slate-800",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[left]",
                checked ? "left-[26px]" : "left-0.5",
              )}
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const COMMAND_ICONS = {
  approvals: Shield,
  modules: Box,
  privacy: Lock,
  reports: AlertTriangle,
  ai: Cpu,
  analytics: BarChart3,
  audit: ClipboardList,
  settings: Settings,
  library: BookOpen,
  churchLocations: MapPin,
  churches: Church,
  monasteries: Mountain,
  contentReview: FileText,
  mediaManager: ImageIcon,
  team: Users,
};
