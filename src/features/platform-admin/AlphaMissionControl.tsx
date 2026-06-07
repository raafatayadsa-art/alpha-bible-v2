import {
  COMMAND_ICONS,
  EmergencyBanner,
  LuxuryCommandCard,
  LuxuryHeroPanel,
  MissionControlShell,
  MissionHeader,
} from "./mission-control-ui";
import { usePlatformDashboard } from "./use-platform-dashboard";
import { MC } from "./platform-store";

export function AlphaMissionControl() {
  const dash = usePlatformDashboard();

  return (
    <MissionControlShell
      toolbarActive="home"
      toolbarBadges={{ approvals: dash.pendingApprovals, alerts: dash.criticalAlerts }}
    >
      <MissionHeader />

      <LuxuryHeroPanel
        platformHealth={dash.healthScore}
        pendingApprovals={dash.pendingApprovals}
        criticalAlerts={dash.criticalAlerts}
        churches={dash.stats.churchesLabel}
        users={dash.stats.usersLabel}
      />

      <div className="mb-2.5 grid grid-cols-2 gap-2.5">
        <LuxuryCommandCard
          to="/platform/approvals"
          size="large"
          title="مركز الاعتمادات"
          titleEn="Approvals Center"
          subtitle={`${dash.pendingApprovals} طلب معلق تحتاج مراجعة`}
          icon={COMMAND_ICONS.approvals}
          accent={MC.gold}
          badge={dash.pendingApprovals}
          actionLabel="عرض جميع الطلبات"
        />
        <LuxuryCommandCard
          to="/platform/privacy"
          size="large"
          title="الخصوصية والأمان"
          titleEn="Privacy & Security"
          subtitle="حماية البيانات · التشفير · المراقبة"
          icon={COMMAND_ICONS.privacy}
          accent={MC.green}
          actionLabel="إعدادات الأمان"
        />
      </div>

      <div className="mb-2.5 grid grid-cols-2 gap-2.5">
        <LuxuryCommandCard
          to="/platform/modules"
          size="large"
          title="إدارة الموديولات"
          titleEn="Module Control"
          subtitle="تشغيل وإيقاف ميزات المنصة"
          icon={COMMAND_ICONS.modules}
          accent={MC.purple}
          actionLabel="إدارة الموديولات"
        />
        <LuxuryCommandCard
          to="/platform/reports"
          size="large"
          title="المحتوى المبلغ"
          titleEn="Reported Content"
          subtitle={`${dash.summary.reports} بلاغات تحتاج مراجعة`}
          icon={COMMAND_ICONS.reports}
          accent={MC.red}
          badge={dash.summary.reports}
          actionLabel="عرض البلاغات"
        />
      </div>

      <div className="mb-2.5 grid grid-cols-3 gap-2">
        <LuxuryCommandCard
          to="/platform/analytics"
          size="compact"
          title="التحليلات"
          titleEn="Analytics"
          subtitle="تقارير عامة"
          icon={COMMAND_ICONS.analytics}
          accent={MC.blue}
          actionLabel="عرض"
        />
        <LuxuryCommandCard
          to="/platform/ai"
          size="compact"
          title="AI Control"
          subtitle="Auto Moderation"
          icon={COMMAND_ICONS.ai}
          accent={MC.purple}
          actionLabel="فتح"
        />
        <LuxuryCommandCard
          to="/platform/audit"
          size="compact"
          title="سجل التدقيق"
          titleEn="Audit"
          subtitle="عمليات مسجّلة"
          icon={COMMAND_ICONS.audit}
          accent={MC.blue}
          actionLabel="عرض"
        />
      </div>

      <div className="mb-2.5 grid grid-cols-2 gap-2.5">
        <LuxuryCommandCard
          to="/platform/settings"
          size="medium"
          title="إعدادات النظام"
          titleEn="Settings"
          subtitle="إعدادات المنصة العامة"
          icon={COMMAND_ICONS.settings}
          accent={MC.steel}
          actionLabel="فتح الإعدادات"
        />
        <LuxuryCommandCard
          to="/platform/library"
          size="medium"
          title="مكتبة Alpha"
          titleEn="Library"
          subtitle="وثائق · أدلة · سياسات"
          icon={COMMAND_ICONS.library}
          accent={MC.blue}
          actionLabel="فتح المكتبة"
        />
      </div>

      <EmergencyBanner to="/platform/emergency" />
    </MissionControlShell>
  );
}
