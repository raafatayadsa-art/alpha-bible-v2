import type { LucideIcon } from "lucide-react";
import { COMMAND_ICONS } from "../mission-control-ui";
import { MC } from "../platform-store";
import { formatPlatformNumber, PP_GOLD } from "../PlatformPremiumUI";
import type { MediaManagerStats } from "../media-manager-api";
import type { usePlatformDashboard } from "../use-platform-dashboard";

type Dash = ReturnType<typeof usePlatformDashboard>;

export type FounderModuleDef = {
  to: string;
  title: string;
  titleEn: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  badge?: number;
  metrics?: { label: string; value: string }[];
};

export function buildFounderModules(dash: Dash, mediaStats: MediaManagerStats | null = null) {
  const core: FounderModuleDef[] = [
    {
      to: "/platform/approvals",
      title: "مركز الاعتمادات",
      titleEn: "Approvals",
      subtitle: "طلبات بانتظار المراجعة",
      icon: COMMAND_ICONS.approvals,
      accent: MC.gold,
      badge: dash.pendingApprovals,
      metrics: [
        { label: "Pending", value: formatPlatformNumber(dash.pendingApprovals) },
        { label: "Requests", value: formatPlatformNumber(dash.stats.requests) },
      ],
    },
    {
      to: "/platform/privacy",
      title: "الخصوصية والأمان",
      titleEn: "Privacy",
      subtitle: "Encryption · monitoring",
      icon: COMMAND_ICONS.privacy,
      accent: MC.green,
    },
    {
      to: "/platform/modules",
      title: "إدارة الموديولات",
      titleEn: "Modules",
      subtitle: "تشغيل وإيقاف الميزات",
      icon: COMMAND_ICONS.modules,
      accent: MC.purple,
    },
    {
      to: "/platform/reports",
      title: "المحتوى المبلغ",
      titleEn: "Reports",
      subtitle: "بلاغات مفتوحة",
      icon: COMMAND_ICONS.reports,
      accent: MC.red,
      badge: dash.summary.reports,
      metrics: [
        { label: "Reports", value: formatPlatformNumber(dash.stats.reports) },
        { label: "Alerts", value: formatPlatformNumber(dash.criticalAlerts) },
      ],
    },
  ];

  const tools: FounderModuleDef[] = [
    {
      to: "/platform/church-locations",
      title: "مدير مواقع الكنائس",
      titleEn: "Locations",
      subtitle: "Google Maps workflow",
      icon: COMMAND_ICONS.churchLocations,
      accent: PP_GOLD,
    },
    {
      to: "/platform/publisher-center",
      title: "مركز الناشرين",
      titleEn: "Publisher",
      subtitle: "نشر · حقوق · طلبات",
      icon: COMMAND_ICONS.contentReview,
      accent: MC.gold,
    },
    {
      to: "/platform/content-review",
      title: "مراجعة المحتوى",
      titleEn: "Content",
      subtitle: "Pending Review",
      icon: COMMAND_ICONS.contentReview,
      accent: MC.cyan,
    },
    {
      to: "/platform/media-manager",
      title: "Media Manager",
      titleEn: "Media",
      subtitle: "alpha-media · مراجعة الوسائط",
      icon: COMMAND_ICONS.mediaManager,
      accent: PP_GOLD,
      badge: mediaStats?.pending,
      metrics: mediaStats
        ? [
            { label: "Pending", value: formatPlatformNumber(mediaStats.pending) },
            { label: "Approved", value: formatPlatformNumber(mediaStats.approved) },
          ]
        : [
            { label: "Bucket", value: "alpha-media" },
            { label: "Phase", value: "1" },
          ],
    },
    {
      to: "/platform/churches",
      title: "صفحات الكنائس",
      titleEn: "Churches",
      subtitle: "page lifecycle",
      icon: COMMAND_ICONS.churches,
      accent: MC.purple,
    },
    {
      to: "/platform/monasteries",
      title: "إدارة الأديرة",
      titleEn: "Monasteries",
      subtitle: "Monastery pages",
      icon: COMMAND_ICONS.monasteries,
      accent: MC.cyan,
    },
    {
      to: "/platform/analytics",
      title: "التحليلات",
      titleEn: "Analytics",
      subtitle: "Platform metrics",
      icon: COMMAND_ICONS.analytics,
      accent: MC.blue,
      metrics: [
        { label: "Users", value: formatPlatformNumber(dash.stats.users) },
        { label: "Churches", value: formatPlatformNumber(dash.stats.churches) },
      ],
    },
    {
      to: "/platform/ai",
      title: "AI Control",
      titleEn: "Moderation",
      subtitle: "AI rules · queues",
      icon: COMMAND_ICONS.ai,
      accent: MC.purple,
    },
    {
      to: "/platform/audit",
      title: "سجل التدقيق",
      titleEn: "Audit",
      subtitle: "Admin operations",
      icon: COMMAND_ICONS.audit,
      accent: MC.blue,
    },
  ];

  const system: FounderModuleDef[] = [
    {
      to: "/platform/team",
      title: "فريق Alpha",
      titleEn: "Team",
      subtitle: "دعوة المساعدين والصلاحيات",
      icon: COMMAND_ICONS.team,
      accent: PP_GOLD,
    },
    {
      to: "/platform/settings",
      title: "إعدادات النظام",
      titleEn: "Settings",
      subtitle: "Global configuration",
      icon: COMMAND_ICONS.settings,
      accent: MC.steel,
      metrics: [
        { label: "Servants", value: formatPlatformNumber(dash.stats.servants) },
        { label: "Reports", value: formatPlatformNumber(dash.stats.reports) },
      ],
    },
    {
      to: "/platform/library",
      title: "مكتبة Alpha",
      titleEn: "Library",
      subtitle: "Policies · guides",
      icon: COMMAND_ICONS.library,
      accent: MC.blue,
    },
  ];

  return { core, tools, system };
}
