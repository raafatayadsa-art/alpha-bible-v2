import type { ChurchDirectoryMapPin } from "@/features/church-directory/types";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Church,
  Flag,
  Heart,
  MessageCircle,
  ScrollText,
  Shield,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { MC } from "../platform-store";
import { formatPlatformNumber, PP_GOLD } from "../PlatformPremiumUI";
import type { usePlatformDashboard } from "../use-platform-dashboard";
import type { MediaManagerStats } from "../media-manager-api";
import type { DrillData } from "./DrillSheet";

export type Dash = ReturnType<typeof usePlatformDashboard>;

export function buildGrowthSeries(total: number, points = 7) {
  const base = Math.max(total * 0.82, 1);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].slice(0, points);
  return labels.map((label, i) => ({
    label,
    value: Math.round(base + ((total - base) * (i + 1)) / labels.length),
  }));
}

export function build30DaySeries(total: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}`,
    value: Math.round(total * (0.72 + (0.28 * (i + 1)) / 12)),
  }));
}

export function build14DaySeries(total: number) {
  return Array.from({ length: 14 }, (_, i) => ({
    label: `${i + 1}`,
    value: Math.round(total * (0.78 + (0.22 * (i + 1)) / 14)),
  }));
}

export function buildTopCitiesFromPins(pins: ChurchDirectoryMapPin[]) {
  const byCity = new Map<string, number>();
  for (const pin of pins) {
    const key = pin.city?.trim() || pin.governorate?.trim() || "غير محدد";
    byCity.set(key, (byCity.get(key) ?? 0) + 1);
  }
  return [...byCity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

/** @deprecated use buildTopCitiesFromPins */
export function buildTopCities(_liveTotal: number) {
  return [] as { name: string; code: string; count: number }[];
}

export function buildHealthDrill(dash: Dash): DrillData {
  const checks = buildHealthChecks(dash);
  return {
    title: "حالة المنصة",
    subtitle: "Alpha Health · جميع الأنظمة",
    value: `${dash.healthScore}%`,
    delta: dash.healthScore >= 95 ? "ممتاز" : dash.healthScore >= 85 ? "جيد" : "يحتاج انتباه",
    deltaTone: dash.healthScore >= 85 ? "up" : "down",
    breakdown: checks.map((c) => ({
      label: c.label,
      value: c.value,
      hint: c.ok && !c.warn ? "تشغيل طبيعي" : c.warn ? "مراقبة" : "تنبيه",
      tone: c.ok && !c.warn ? ("up" as const) : c.warn ? undefined : ("down" as const),
    })),
  };
}

export type HealthCheck = {
  label: string;
  value: string;
  ok: boolean;
  warn?: boolean;
};

function healthLabel(status: string | undefined): string {
  if (status === "operational") return "تشغيل";
  if (status === "degraded") return "متدهور";
  return "متوقف";
}

export function buildHealthChecks(dash: Dash): HealthCheck[] {
  const h = dash.health;
  return [
    { label: "قاعدة البيانات", value: dash.loading ? "…" : healthLabel(h?.database), ok: h?.database === "operational" },
    { label: "Supabase", value: dash.loading ? "…" : healthLabel(h?.supabase), ok: h?.supabase === "operational" },
    { label: "Auth", value: dash.loading ? "…" : healthLabel(h?.auth), ok: h?.auth === "operational" },
    { label: "Storage", value: dash.loading ? "…" : healthLabel(h?.storage), ok: h?.storage === "operational" },
    {
      label: "بلاغات مفتوحة",
      value: dash.loading ? "…" : formatPlatformNumber(dash.criticalAlerts),
      ok: dash.criticalAlerts === 0,
      warn: dash.criticalAlerts > 0,
    },
  ];
}

export type PlatformIndicator = {
  key: string;
  label: string;
  value: string;
  delta: string;
  deltaTone?: "up" | "down" | "neutral";
  color: string;
  icon: LucideIcon;
  drill: DrillData;
};

function indicatorDelta(value: number, loading: boolean): { delta: string; tone: "up" | "down" | "neutral" } {
  if (loading) return { delta: "…", tone: "neutral" };
  if (value <= 0) return { delta: "—", tone: "neutral" };
  return { delta: `+${formatPlatformNumber(value)} ↗`, tone: "up" };
}

export function buildPlatformIndicators(dash: Dash): PlatformIndicator[] {
  const { users, churches, priests, servants, messages, requests, reports } = dash.stats;
  const health = dash.healthScore;
  const errorRate = dash.criticalAlerts > 0 ? dash.criticalAlerts : 0;

  const mk = (
    key: string,
    label: string,
    display: string,
    raw: number,
    color: string,
    icon: LucideIcon,
    drillTitle: string,
    deltaOverride?: { delta: string; tone: "up" | "down" | "neutral" },
  ): PlatformIndicator => {
    const d = deltaOverride ?? indicatorDelta(raw, dash.loading);
    return {
      key,
      label,
      value: dash.loading ? "…" : display,
      delta: d.delta,
      deltaTone: d.tone,
      color,
      icon,
      drill: {
        title: drillTitle,
        subtitle: "بيانات حية من Supabase",
        value: dash.loading ? "…" : display,
        delta: d.delta !== "—" && d.delta !== "…" ? d.delta : undefined,
        deltaTone: d.tone === "up" ? "up" : d.tone === "down" ? "down" : undefined,
        breakdown: [{ label, value: dash.loading ? "…" : display }],
      },
    };
  };

  return [
    mk("churches", "الكنائس", formatPlatformNumber(churches), churches, MC.purple, Heart, "الكنائس"),
    mk("active", "نشطون اليوم", formatPlatformNumber(messages), messages, MC.green, Activity, "نشاط اليوم"),
    mk("users", "إجمالي المستخدمين", formatPlatformNumber(users), users, MC.blue, Users, "إجمالي المستخدمين"),
    mk("session", "مدة الجلسة", "—", 0, MC.amber, Timer, "مدة الجلسة", { delta: "—", tone: "neutral" }),
    mk("countries", "الدول", "—", 0, MC.cyan, Flag, "الدول", { delta: "—", tone: "neutral" }),
    mk("priests", "الكهنة", formatPlatformNumber(priests), priests, MC.greenBright, Shield, "الكهنة"),
    mk("comments", "تعليقات اليوم", formatPlatformNumber(reports), reports, MC.pink, MessageCircle, "البلاغات"),
    mk(
      "errors",
      "معدل الأعطال",
      dash.loading ? "…" : `${errorRate}%`,
      errorRate,
      MC.red,
      AlertTriangle,
      "معدل الأعطال",
      errorRate > 0
        ? { delta: "↑", tone: "down" }
        : { delta: "0.12%- ↗", tone: "up" },
    ),
    mk(
      "retention",
      "معدل الاحتفاظ",
      dash.loading ? "…" : `${health}%`,
      health,
      MC.purple,
      TrendingUp,
      "معدل الاحتفاظ",
      health > 0 ? { delta: `+${Math.min(99, health)}% ↗`, tone: "up" } : { delta: "—", tone: "neutral" },
    ),
    mk("requests", "طلبات الاعتماد", formatPlatformNumber(requests), requests, MC.amber, ScrollText, "طلبات الاعتماد"),
    mk("approvals", "بانتظار الاعتماد", formatPlatformNumber(dash.pendingApprovals), dash.pendingApprovals, MC.green, BookOpen, "بانتظار الاعتماد"),
  ].slice(0, 9);
}

export function buildGlobalMapDrill(dash: Dash, pins: ChurchDirectoryMapPin[] = []): DrillData {
  const topCities = buildTopCitiesFromPins(pins);
  const activeCities = new Set(pins.map((p) => p.city || p.governorate).filter(Boolean)).size;

  return {
    title: "خريطة النشاط العالمي",
    subtitle: "كنائس موثّقة على الخريطة",
    value: formatPlatformNumber(pins.length),
    breakdown: [
      { label: "كنائس", value: formatPlatformNumber(pins.length) },
      { label: "مدن", value: formatPlatformNumber(activeCities) },
      { label: "مستخدمون", value: formatPlatformNumber(dash.stats.users) },
    ],
    cityRows: topCities.map((c) => ({
      name: c.name,
      code: "",
      count: formatPlatformNumber(c.count),
    })),
  };
}

export type AttentionItem = {
  id: string;
  title: string;
  count: number;
  action: string;
  to: string;
  color: string;
  icon: LucideIcon;
};

export function buildAttentionItems(dash: Dash, mediaStats: MediaManagerStats | null): AttentionItem[] {
  const items: AttentionItem[] = [];
  if (dash.stats.reports > 0 || dash.criticalAlerts > 0) {
    items.push({
      id: "reports",
      title: "بلاغات جديدة",
      count: dash.stats.reports || dash.criticalAlerts,
      action: "مراجعة",
      to: "/platform/reports",
      color: MC.red,
      icon: Flag,
    });
  }
  if (dash.pendingApprovals > 0) {
    items.push({
      id: "churches",
      title: "كنائس تنتظر الاعتماد",
      count: dash.pendingApprovals,
      action: "مراجعة",
      to: "/platform/approvals",
      color: PP_GOLD,
      icon: Heart,
    });
  }
  if (dash.pendingApprovals > 0) {
    items.push({
      id: "priests",
      title: "طلبات تحتاج مراجعة",
      count: dash.pendingApprovals,
      action: "مراجعة",
      to: "/platform/approvals",
      color: MC.purple,
      icon: Shield,
    });
  }
  if (mediaStats && mediaStats.pending > 0) {
    items.push({
      id: "media",
      title: "وسائط بانتظار المراجعة",
      count: mediaStats.pending,
      action: "مراجعة",
      to: "/platform/media-manager",
      color: PP_GOLD,
      icon: BookOpen,
    });
  }
  if (dash.criticalAlerts > 0) {
    items.push({
      id: "server",
      title: "أخطاء حرجة في الخادم",
      count: dash.criticalAlerts,
      action: "فحص",
      to: "/platform/privacy",
      color: MC.red,
      icon: AlertTriangle,
    });
  }
  return items.slice(0, 5);
}

export type FeatureUsageRow = {
  id: string;
  label: string;
  value: number;
  display: string;
  pct: number;
  trend: number;
  color: string;
  icon: LucideIcon;
};

export function buildFeatureUsage(dash: Dash): FeatureUsageRow[] {
  const { users, churches, priests, servants, messages, requests, reports } = dash.stats;
  const rows = [
    { id: "users", label: "المستخدمون", value: users, trend: 0, color: MC.blue, icon: Users },
    { id: "churches", label: "الكنائس", value: churches, trend: 0, color: PP_GOLD, icon: Church },
    { id: "priests", label: "الكهنة", value: priests, trend: 0, color: MC.purple, icon: Shield },
    { id: "servants", label: "الخدام", value: servants, trend: 0, color: MC.gold, icon: Heart },
    { id: "messages", label: "الرسائل", value: messages, trend: 0, color: MC.cyan, icon: MessageCircle },
    { id: "requests", label: "طلبات الاعتماد", value: requests, trend: 0, color: MC.amber, icon: ScrollText },
    { id: "reports", label: "البلاغات المفتوحة", value: reports, trend: 0, color: MC.red, icon: AlertTriangle },
  ];
  const max = Math.max(...rows.map((r) => r.value), 1);
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    value: r.value,
    display: formatPlatformNumber(r.value),
    pct: Math.round((r.value / max) * 100),
    trend: r.trend,
    color: r.color,
    icon: r.icon,
  }));
}

/** @deprecated no synthetic live count — use real map pins / dashboard stats */
export function deriveLiveNow(users: number) {
  return users;
}

/** @deprecated use buildTopCitiesFromPins */
export function deriveActiveCities(churches: number) {
  return churches;
}
