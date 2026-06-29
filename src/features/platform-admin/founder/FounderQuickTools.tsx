import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Box,
  Brain,
  Building2,
  Cloud,
  FileText,
  Flag,
  ImageIcon,
  Lock,
  Settings,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import type { MediaManagerStats } from "../media-manager-api";
import { MC } from "../platform-store";
import { formatPlatformNumber, PP_GOLD } from "../PlatformPremiumUI";
import { FounderIcon3D } from "./FounderIcon3D";

type QuickTool = {
  id: string;
  labelAr: string;
  to: string;
  icon: LucideIcon;
  accent: string;
};

const QUICK_TOOLS: QuickTool[] = [
  { id: "churches", labelAr: "الكنائس", to: "/platform/churches", icon: Building2, accent: MC.green },
  { id: "priests", labelAr: "الكهنة", to: "/platform/approvals", icon: Shield, accent: MC.purple },
  { id: "users", labelAr: "المستخدمون", to: "/platform/analytics", icon: Users, accent: MC.blue },
  { id: "flags", labelAr: "البلاغات", to: "/platform/reports", icon: Flag, accent: MC.red },
  { id: "content", labelAr: "المحتوى", to: "/platform/content-review", icon: FileText, accent: MC.blue },
  { id: "words", labelAr: "كلمات مسيئة", to: "/platform/ai", icon: Trash2, accent: MC.red },
  { id: "security", labelAr: "الأمن", to: "/platform/privacy", icon: Lock, accent: MC.purple },
  { id: "reports", labelAr: "التقارير", to: "/platform/library", icon: BarChart3, accent: MC.amber },
  { id: "analytics", labelAr: "التحليلات", to: "/platform/analytics", icon: Brain, accent: MC.purple },
  { id: "notifications", labelAr: "الإشعارات", to: "/platform/settings", icon: Bell, accent: MC.blue },
  { id: "backup", labelAr: "النسخ الاحتياطي", to: "/platform/settings", icon: Cloud, accent: MC.cyan },
  { id: "settings", labelAr: "الإعدادات", to: "/platform/settings", icon: Settings, accent: MC.green },
];

function FeaturedQuickCard({
  to,
  labelAr,
  labelEn,
  icon: Icon,
  accent,
  badge,
  metrics,
}: {
  to: string;
  labelAr: string;
  labelEn: string;
  icon: LucideIcon;
  accent: string;
  badge?: number;
  metrics: { label: string; value: string }[];
}) {
  return (
    <Link
      to={to}
      className="relative block overflow-hidden rounded-[18px] border p-3.5 transition active:scale-[0.98]"
      style={{
        borderColor: MC.panelBorder,
        background: MC.panel,
      }}
    >
      {badge != null && badge > 0 ? (
        <span
          className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold tabular-nums"
          style={{ background: MC.green, color: "#000000" }}
        >
          {badge > 99 ? "99+" : formatPlatformNumber(badge)}
        </span>
      ) : null}
      <div className="flex items-start gap-3" dir="rtl">
        <FounderIcon3D icon={Icon} accent={accent} size="lg" />
        <div className="min-w-0 flex-1 text-right">
          <h3 className="text-[15px] font-extrabold leading-tight" style={{ color: MC.white }}>
            {labelAr}
          </h3>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: `${accent}cc` }}>
            {labelEn}
          </p>
        </div>
      </div>
      <div
        className="mt-3 grid gap-px overflow-hidden rounded-[12px] border"
        style={{
          borderColor: MC.panelBorder,
          background: MC.panelBorder,
          gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`,
        }}
      >
        {metrics.map((m) => (
          <div key={m.label} className="px-2 py-2 text-center" style={{ background: MC.panel }}>
            <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: MC.muted }}>
              {m.label}
            </p>
            <p className="mt-0.5 font-mono text-[18px] font-extrabold leading-none tabular-nums" style={{ color: accent }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}

export function FounderQuickTools({
  mediaPending,
  mediaStats,
  openReports = 0,
  modulesEnabled = 0,
  modulesDisabled = 0,
  modulesTotal = 0,
}: {
  mediaPending?: number;
  mediaStats?: MediaManagerStats | null;
  openReports?: number;
  modulesEnabled?: number;
  modulesDisabled?: number;
  modulesTotal?: number;
}) {
  return (
    <div className="mb-3">
      <p className="mb-2 px-0.5 text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: MC.muted }}>
        أدوات التحكم السريع
      </p>

      <div className="mb-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <FeaturedQuickCard
          to="/platform/modules"
          labelAr="إدارة الموديولات"
          labelEn="Modules"
          icon={Box}
          accent={MC.purple}
          metrics={[
            { label: "مفعّل", value: formatPlatformNumber(modulesEnabled) },
            { label: "موقوف", value: formatPlatformNumber(modulesDisabled) },
            { label: "الكل", value: formatPlatformNumber(modulesTotal || modulesEnabled + modulesDisabled) },
          ]}
        />
        <FeaturedQuickCard
          to="/platform/media-manager"
          labelAr="مدير الوسائط"
          labelEn="Media Manager"
          icon={ImageIcon}
          accent={MC.green}
          badge={mediaPending}
          metrics={
            mediaStats
              ? [
                  { label: "Pending", value: formatPlatformNumber(mediaStats.pending) },
                  { label: "Approved", value: formatPlatformNumber(mediaStats.approved) },
                ]
              : [
                  { label: "Bucket", value: "alpha-media" },
                  { label: "Pending", value: mediaPending != null ? formatPlatformNumber(mediaPending) : "—" },
                ]
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {QUICK_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const badge =
            tool.id === "flags" && openReports > 0
              ? openReports
              : tool.id === "content" && mediaPending != null && mediaPending > 0
                ? mediaPending
                : null;
          return (
            <Link
              key={tool.id}
              to={tool.to}
              className="relative flex flex-col items-center gap-2 rounded-[14px] border px-1.5 py-3 text-center transition active:scale-[0.96]"
              style={{
                borderColor: badge ? `${MC.green}55` : MC.panelBorder,
                background: MC.panel,
              }}
            >
              {badge != null ? (
                <span
                  className="absolute right-1 top-1 grid min-h-[16px] min-w-[16px] place-items-center rounded-full px-1 text-[8px] font-extrabold tabular-nums"
                  style={{ background: tool.id === "flags" ? MC.red : MC.gold, color: MC.midnight }}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
              <FounderIcon3D icon={Icon} accent={tool.accent} size="md" />
              <span className="text-[10px] font-extrabold leading-tight" style={{ color: MC.white }}>
                {tool.labelAr}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
