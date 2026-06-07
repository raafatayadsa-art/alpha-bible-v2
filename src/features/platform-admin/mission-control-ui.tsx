import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  ChevronLeft,
  ClipboardList,
  Cpu,
  LayoutDashboard,
  Lock,
  Scan,
  Settings,
  Shield,
  Siren,
  User,
} from "lucide-react";
import alphaLogo from "@/assets/alpha-logo.png";
import { cn } from "@/lib/utils";
import { MC } from "./platform-store";

const GRID_BG = {
  backgroundColor: MC.bg,
  backgroundImage: `
    radial-gradient(ellipse 120% 60% at 50% -15%, rgba(139, 122, 184, 0.12), transparent 55%),
    radial-gradient(ellipse 80% 40% at 80% 20%, rgba(196, 165, 116, 0.06), transparent 50%),
    linear-gradient(180deg, ${MC.midnight} 0%, ${MC.bg} 100%)
  `,
};

function luxuryShadow(accent: string) {
  return `0 10px 40px -12px rgba(0,0,0,0.55), 0 0 28px -14px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.07)`;
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

export function MissionHeader() {
  const navigate = useNavigate();

  return (
    <header className="mb-2 pt-[max(env(safe-area-inset-top),6px)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <img src={alphaLogo} alt="" className="h-12 w-12 shrink-0 object-contain" />
          <div className="min-w-0 text-right">
            <h1 className="truncate text-[13px] font-extrabold tracking-[0.08em]" style={{ color: MC.white }}>
              A.C.C
            </h1>
            <p className="text-[8px] font-semibold tracking-wide" style={{ color: MC.gold }}>
              Owner Access
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="mr-0.5 flex flex-col items-center gap-0">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full border text-[9px] font-bold"
              style={{ borderColor: MC.panelBorder, background: "rgba(139,122,184,0.2)", color: MC.white }}
            >
              JS
            </div>
            <p className="max-w-[52px] truncate text-[7px] font-bold" style={{ color: MC.white }}>
              جون سامي
            </p>
          </div>
          <button
            type="button"
            aria-label="Scan Center"
            onClick={() => navigate({ to: "/platform/scan" })}
            className="grid h-8 w-8 place-items-center rounded-[10px] border active:scale-95"
            style={{ borderColor: MC.panelBorder, background: "rgba(15,22,40,0.9)", boxShadow: luxuryShadow(MC.purple) }}
          >
            <Scan className="h-3.5 w-3.5" style={{ color: MC.purple }} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => navigate({ to: "/platform/approvals" })}
            className="grid h-8 w-8 place-items-center rounded-[10px] border active:scale-95"
            style={{ borderColor: MC.panelBorder, background: "rgba(15,22,40,0.9)" }}
          >
            <Bell className="h-3.5 w-3.5" style={{ color: MC.white }} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Settings"
            onClick={() => navigate({ to: "/platform/settings" })}
            className="grid h-8 w-8 place-items-center rounded-[10px] border active:scale-95"
            style={{ borderColor: MC.panelBorder, background: "rgba(15,22,40,0.9)" }}
          >
            <Settings className="h-3.5 w-3.5" style={{ color: MC.white }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function LuxuryHeroPanel({
  pendingApprovals = 0,
  criticalAlerts = 0,
  platformHealth = 98,
  churches = "356",
  users = "12.4K",
}: {
  pendingApprovals?: number;
  criticalAlerts?: number;
  platformHealth?: number;
  churches?: string;
  users?: string;
}) {
  const [ts, setTs] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTs(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const sync = ts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const uptime = ts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const stats = [
    { label: "Platform Health", value: `${platformHealth}%`, color: MC.green },
    { label: "Pending Approvals", value: String(pendingApprovals), color: MC.purple },
    { label: "Critical Alerts", value: String(criticalAlerts), color: MC.red },
    { label: "Users", value: users, color: MC.blue },
    { label: "Churches", value: churches, color: MC.gold },
  ];

  return (
    <CyberPanel glow={MC.purple} padding={false} className="mb-3">
      <div className="p-3">
        <div className="mb-2.5 flex items-center justify-between gap-2 border-b pb-2" style={{ borderColor: MC.panelBorder }}>
          <div className="flex items-center gap-1.5">
            <LiveDot color={MC.green} pulse />
            <p className="text-[9px] font-bold" style={{ color: MC.green }}>
              Operational
            </p>
          </div>
          <p className="text-[8px] font-semibold tabular-nums" style={{ color: MC.muted }}>
            Last Sync {sync}
          </p>
        </div>

        <div className="grid grid-cols-5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn("min-w-0 px-1 py-0.5 text-center", i > 0 && "border-r")}
              style={i > 0 ? { borderColor: MC.panelBorder } : undefined}
            >
              <p className="truncate text-[6.5px] font-semibold uppercase leading-tight" style={{ color: MC.muted }}>
                {s.label}
              </p>
              <p className="text-[14px] font-extrabold tabular-nums leading-tight" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-1 border-t pt-2 text-[7px] font-semibold" style={{ borderColor: MC.panelBorder, color: MC.muted }}>
          <span>Network Stable</span>
          <span>Performance Excellent</span>
          <span className="tabular-nums">Uptime {uptime}</span>
        </div>
      </div>
    </CyberPanel>
  );
}

/** @deprecated */ export const GlobalNetworkPanel = LuxuryHeroPanel;

export function QuickStatsRow({
  users = "12.4K",
  churches = "356",
  priests = "125",
  servants = "1.2K",
}: {
  users?: string;
  churches?: string;
  priests?: string;
  servants?: string;
}) {
  const stats = useMemo(
    () => [
      { label: "المستخدمون", value: users, color: MC.electric, icon: User },
      { label: "الكنائس", value: churches, color: MC.amber, icon: Shield },
      { label: "الكهنة", value: priests, color: MC.purple, icon: User },
      { label: "الخدام", value: servants, color: MC.green, icon: User },
    ],
    [users, churches, priests, servants],
  );

  return (
    <div className="mb-2.5 grid grid-cols-4 gap-1">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-[8px] border px-1 py-1.5"
            style={{
              borderColor: MC.panelBorder,
              background: MC.panel,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <Icon className="mb-0.5 h-3 w-3" style={{ color: s.color }} strokeWidth={2} />
            <p className="font-mono text-[13px] font-extrabold tabular-nums leading-none text-slate-100">{s.value}</p>
            <p className="mt-0.5 text-center text-[6.5px] font-semibold leading-tight text-slate-500">{s.label}</p>
          </div>
        );
      })}
    </div>
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
          background: "linear-gradient(135deg, rgba(184,92,88,0.18) 0%, rgba(15,22,40,0.95) 55%)",
          boxShadow: luxuryShadow(MC.red),
        }}
      >
        <div className="flex items-center gap-3 p-3.5">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border"
            style={{ borderColor: `${MC.red}55`, background: `${MC.red}22`, boxShadow: `0 0 24px -6px ${MC.red}88` }}
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

export type OwnerToolbarActive = "home" | "approvals" | "scan" | "alerts" | "settings";

export function OwnerToolbar({
  active = "home",
  badges = {},
}: {
  active?: OwnerToolbarActive;
  badges?: { approvals?: number; alerts?: number };
}) {
  const navigate = useNavigate();
  const sideItems: { id: OwnerToolbarActive; label: string; icon: typeof LayoutDashboard; to: string; badgeKey?: "approvals" | "alerts" }[] = [
    { id: "home", label: "لوحة التحكم", icon: LayoutDashboard, to: "/platform" },
    { id: "approvals", label: "الموافقات", icon: Shield, to: "/platform/approvals", badgeKey: "approvals" },
    { id: "alerts", label: "التنبيهات", icon: Bell, to: "/platform/approvals", badgeKey: "alerts" },
    { id: "settings", label: "الإعدادات", icon: Settings, to: "/platform/settings" },
  ];

  const left = sideItems.slice(0, 2);
  const right = sideItems.slice(2);

  function SideBtn(item: (typeof sideItems)[number]) {
    const Icon = item.icon;
    const on = active === item.id;
    const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => navigate({ to: item.to as "/" })}
        className="relative flex flex-1 flex-col items-center gap-0.5 py-1"
      >
        {badge != null && badge > 0 && (
          <span className="absolute -top-0.5 left-1/2 z-10 grid h-4 min-w-4 -translate-x-1/2 place-items-center rounded-full px-0.5 text-[7px] font-bold" style={{ background: MC.red, color: MC.white }}>
            {badge > 99 ? "99+" : badge}
          </span>
        )}
        <Icon className="h-5 w-5" style={{ color: on ? MC.gold : MC.muted }} strokeWidth={2} />
        <span className="text-[8px] font-bold" style={{ color: on ? MC.gold : MC.muted }}>
          {item.label}
        </span>
        {on && <span className="absolute -bottom-0.5 h-0.5 w-6 rounded-full" style={{ background: MC.gold, boxShadow: `0 0 8px ${MC.gold}` }} />}
      </button>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl"
      style={{ borderColor: MC.panelBorder, background: "rgba(8, 12, 24, 0.96)" }}
    >
      <div className="relative mx-auto flex max-w-lg items-end justify-around px-1 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        {left.map(SideBtn)}
        <button
          type="button"
          aria-label="Scan Center"
          onClick={() => navigate({ to: "/platform/scan" })}
          className="relative -mt-6 grid h-14 w-14 place-items-center rounded-full border active:scale-95"
          style={{
            borderColor: `${MC.purple}66`,
            background: "linear-gradient(180deg, rgba(139,122,184,0.35) 0%, rgba(15,22,40,0.98) 100%)",
            boxShadow: `0 8px 32px -8px rgba(0,0,0,0.6), 0 0 28px -6px ${MC.purple}88`,
          }}
        >
          <Scan className="h-6 w-6" style={{ color: MC.white }} strokeWidth={2.2} />
          {active === "scan" && (
            <span className="absolute -bottom-1 h-1 w-8 rounded-full" style={{ background: MC.purple, boxShadow: `0 0 10px ${MC.purple}` }} />
          )}
        </button>
        {right.map(SideBtn)}
      </div>
    </nav>
  );
}

/** @deprecated use OwnerToolbar */ export const MissionBottomNav = OwnerToolbar;

function mapNavToToolbar(nav?: "dashboard" | "quick" | "alerts" | "profile"): OwnerToolbarActive {
  if (nav === "quick") return "scan";
  if (nav === "alerts") return "approvals";
  if (nav === "profile") return "settings";
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
    <div dir="rtl" className="min-h-screen" style={{ ...GRID_BG, color: MC.text }}>
      <div className="mx-auto w-full max-w-lg px-2.5 pb-32 pt-1 sm:px-3">
        {children}
      </div>
      {showNav && <OwnerToolbar active={active} badges={toolbarBadges} />}
    </div>
  );
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
  const navigate = useNavigate();
  return (
    <MissionControlShell showNav navActive={navActive}>
      <div className="mb-3 flex items-center gap-2 pt-[max(env(safe-area-inset-top),8px)]">
        <button
          type="button"
          onClick={() => navigate({ to: "/platform" })}
          className="grid h-10 w-10 place-items-center rounded border"
          style={{ borderColor: MC.panelBorder, background: MC.panel }}
        >
          <ChevronLeft className="h-5 w-5 rotate-180 text-slate-400" />
        </button>
        <div>
          <h1 className="text-[15px] font-extrabold text-white">{title}</h1>
          {titleEn && <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{titleEn}</p>}
        </div>
      </div>
      {children}
    </MissionControlShell>
  );
}

export function PrivacyStrip({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-3 flex items-start gap-2 rounded border px-2.5 py-2 text-[9px] font-bold leading-relaxed"
      style={{ borderColor: `${MC.green}44`, background: `${MC.green}11`, color: "#6ee7b7" }}
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
      className="mb-3 w-full rounded-lg border bg-black/40 px-3 py-2.5 text-[12px] font-semibold text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50"
      style={{ borderColor: MC.panelBorder }}
    />
  );
}

export function CyberFilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition active:scale-95",
        active ? "border-[#6ba3b8]/40 bg-[#6ba3b8]/12 text-slate-200" : "border-slate-700/80 text-slate-500",
      )}
    />
  );
}

export function CyberBtn({
  label,
  onClick,
  variant = "primary",
  className,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "danger" | "ghost" | "warn";
  className?: string;
  disabled?: boolean;
}) {
  const styles = {
    primary: { border: `${MC.steel}55`, background: "rgba(74,111,165,0.12)", color: MC.cyan },
    danger: { border: `${MC.red}44`, background: "rgba(184,84,80,0.1)", color: MC.red },
    ghost: { border: MC.panelBorder, background: "transparent", color: MC.text },
    warn: { border: `${MC.amber}44`, background: "rgba(184,149,74,0.1)", color: MC.amber },
  };
  const s = styles[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("min-h-[44px] rounded-lg border px-3 py-2 text-[11px] font-extrabold transition active:scale-[0.98] disabled:opacity-40", className)}
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
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: MC.panelBorder }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full border transition", checked ? "border-emerald-500/60 bg-emerald-500/30" : "border-slate-700 bg-slate-800")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", checked ? "right-0.5" : "right-[22px]")} />
      </button>
      <span className="text-[12px] font-bold text-slate-200">{label}</span>
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
};
