import {
  COMMAND_ICONS,
  MissionControlShell,
  MissionHeader,
} from "./mission-control-ui";
import { usePlatformDashboard } from "./use-platform-dashboard";
import { MC } from "./platform-store";
import {
  formatPlatformNumber,
  PlatformControlHero,
  PlatformDashboardPanel,
  PlatformEmergencyCard,
  PlatformModuleCard,
  PlatformPremiumStyles,
  PlatformSectionTitle,
  PP_GOLD,
} from "./PlatformPremiumUI";

export function AlphaMissionControl() {
  const dash = usePlatformDashboard();
  const alertCount = dash.pendingApprovals + dash.criticalAlerts;

  const dashboardItems = [
    { label: "Users", value: formatPlatformNumber(dash.stats.users), color: MC.blue },
    { label: "Churches", value: formatPlatformNumber(dash.stats.churches), color: PP_GOLD },
    { label: "Priests", value: formatPlatformNumber(dash.stats.priests), color: MC.purple },
    { label: "Messages", value: formatPlatformNumber(dash.stats.messages), color: MC.cyan },
    { label: "Reports", value: formatPlatformNumber(dash.stats.reports), color: MC.red },
  ];

  return (
    <MissionControlShell
      toolbarActive="home"
      toolbarBadges={{ approvals: dash.pendingApprovals, alerts: dash.criticalAlerts }}
    >
      <PlatformPremiumStyles />
      <MissionHeader alertCount={alertCount} />

      <PlatformControlHero subtitle="لوحة المالك · إدارة المنصة · بيانات حية من قاعدة البيانات" />

      <PlatformDashboardPanel healthScore={dash.healthScore} items={dashboardItems} loading={dash.loading} />

      <PlatformSectionTitle>Core Operations</PlatformSectionTitle>
      <div className="mb-3 space-y-2.5">
        <PlatformModuleCard
          to="/platform/approvals"
          variant="slim"
          title="مركز الاعتمادات"
          titleEn="Approvals"
          subtitle={`${formatPlatformNumber(dash.pendingApprovals)} pending requests`}
          icon={COMMAND_ICONS.approvals}
          accent={MC.gold}
          badge={dash.pendingApprovals}
          actionLabel="Open"
          footerMetrics={[
            { label: "Pending", value: formatPlatformNumber(dash.pendingApprovals) },
            { label: "Requests", value: formatPlatformNumber(dash.stats.requests) },
          ]}
        />
        <PlatformModuleCard
          to="/platform/privacy"
          variant="slim"
          title="الخصوصية والأمان"
          titleEn="Privacy"
          subtitle="Encryption · monitoring · data protection"
          icon={COMMAND_ICONS.privacy}
          accent={MC.green}
          actionLabel="Open"
          btnTone="blue"
        />
        <PlatformModuleCard
          to="/platform/modules"
          variant="slim"
          title="إدارة الموديولات"
          titleEn="Modules"
          subtitle="Enable or disable platform features"
          icon={COMMAND_ICONS.modules}
          accent={MC.purple}
          actionLabel="Open"
        />
        <PlatformModuleCard
          to="/platform/reports"
          variant="slim"
          title="المحتوى المبلغ"
          titleEn="Reports"
          subtitle={`${formatPlatformNumber(dash.summary.reports)} open reports`}
          icon={COMMAND_ICONS.reports}
          accent={MC.red}
          badge={dash.summary.reports}
          actionLabel="Open"
          btnTone="blue"
          footerMetrics={[
            { label: "Reports", value: formatPlatformNumber(dash.stats.reports) },
            { label: "Alerts", value: formatPlatformNumber(dash.criticalAlerts) },
          ]}
        />
      </div>

      <PlatformSectionTitle>Tools & Analytics</PlatformSectionTitle>
      <div className="mb-3 space-y-2.5">
        <PlatformModuleCard
          to="/platform/church-locations"
          variant="slim"
          title="مدير مواقع الكنائس"
          titleEn="Locations"
          subtitle="Google Maps verification workflow"
          icon={COMMAND_ICONS.churchLocations}
          accent={PP_GOLD}
          actionLabel="Open"
        />
        <PlatformModuleCard
          to="/platform/publisher-center"
          variant="slim"
          title="مركز الناشرين"
          titleEn="Publisher Center"
          subtitle="طلبات · نشر مباشر · بلاغات حقوق النشر"
          icon={COMMAND_ICONS.contentReview}
          accent={MC.gold}
          actionLabel="Open"
          btnTone="blue"
        />
        <PlatformModuleCard
          to="/platform/content-review"
          variant="slim"
          title="مراجعة المحتوى"
          titleEn="Content Review"
          subtitle="ألبومات · ترانيم · كتب — Pending Review"
          icon={COMMAND_ICONS.contentReview}
          accent={MC.cyan}
          actionLabel="Open"
          btnTone="blue"
        />
        <PlatformModuleCard
          to="/platform/churches"
          variant="slim"
          title="إدارة صفحات الكنائس"
          titleEn="Churches"
          subtitle="page_status lifecycle · inactive / claim / verified"
          icon={COMMAND_ICONS.churches}
          accent={MC.purple}
          actionLabel="Open"
        />
        <PlatformModuleCard
          to="/platform/monasteries"
          variant="slim"
          title="إدارة الأديرة"
          titleEn="Monasteries"
          subtitle="Monastery pages foundation · ALPHA-107"
          icon={COMMAND_ICONS.monasteries}
          accent={MC.cyan}
          actionLabel="Open"
          btnTone="blue"
        />
        <PlatformModuleCard
          to="/platform/analytics"
          variant="slim"
          title="التحليلات"
          titleEn="Analytics"
          subtitle="Platform metrics and trends"
          icon={COMMAND_ICONS.analytics}
          accent={MC.blue}
          actionLabel="Open"
          btnTone="blue"
          footerMetrics={[
            { label: "Users", value: formatPlatformNumber(dash.stats.users) },
            { label: "Churches", value: formatPlatformNumber(dash.stats.churches) },
          ]}
        />
        <PlatformModuleCard
          to="/platform/ai"
          variant="slim"
          title="AI Control"
          titleEn="Moderation"
          subtitle="AI rules and review queues"
          icon={COMMAND_ICONS.ai}
          accent={MC.purple}
          actionLabel="Open"
        />
        <PlatformModuleCard
          to="/platform/audit"
          variant="slim"
          title="سجل التدقيق"
          titleEn="Audit"
          subtitle="Recorded admin operations"
          icon={COMMAND_ICONS.audit}
          accent={MC.blue}
          actionLabel="Open"
          btnTone="blue"
        />
      </div>

      <PlatformSectionTitle>System</PlatformSectionTitle>
      <div className="mb-3 space-y-2.5">
        <PlatformModuleCard
          to="/platform/settings"
          variant="slim"
          title="إعدادات النظام"
          titleEn="Settings"
          subtitle="Global platform configuration"
          icon={COMMAND_ICONS.settings}
          accent={MC.steel}
          actionLabel="Open"
          footerMetrics={[
            { label: "Servants", value: formatPlatformNumber(dash.stats.servants) },
            { label: "Reports", value: formatPlatformNumber(dash.stats.reports) },
          ]}
        />
        <PlatformModuleCard
          to="/platform/library"
          variant="slim"
          title="مكتبة Alpha"
          titleEn="Library"
          subtitle="Policies · guides · documentation"
          icon={COMMAND_ICONS.library}
          accent={MC.blue}
          actionLabel="Open"
          btnTone="blue"
        />
      </div>

      <PlatformSectionTitle>Emergency</PlatformSectionTitle>
      <PlatformEmergencyCard to="/platform/emergency" />
    </MissionControlShell>
  );
}
