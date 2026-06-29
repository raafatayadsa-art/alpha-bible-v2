import { useMemo, useState } from "react";
import { MissionControlShell } from "./mission-control-ui";
import { FounderControlHeader } from "./founder/FounderControlHeader";
import { buildFounderModules, type FounderModuleDef } from "./founder/founder-modules-config";
import { useAdminPermissions } from "./admin-team/useAdminPermissions";
import { FounderEmergencyModuleCard, FounderModuleSection } from "./founder/FounderModuleGrid";
import { FounderMissionControlHome } from "./founder/FounderMissionControlHome";
import { FounderModulesSheet } from "./founder/FounderModulesSheet";
import { FounderSectionNav } from "./founder/FounderSectionNav";
import { useFounderMediaStats } from "./founder/useFounderMediaStats";
import { usePlatformDashboard } from "./use-platform-dashboard";
import { PlatformPremiumStyles } from "./PlatformPremiumUI";

export function AlphaMissionControl() {
  const dash = usePlatformDashboard();
  const { canAccessRoute, loading: permsLoading, isHiddenOwner } = useAdminPermissions();
  const alertCount = dash.pendingApprovals + dash.criticalAlerts;
  const [modulesOpen, setModulesOpen] = useState(false);
  const [mediaReloadKey, setMediaReloadKey] = useState(0);
  const { stats: mediaStats, loading: mediaLoading } = useFounderMediaStats(mediaReloadKey);
  const rawModules = buildFounderModules(dash, mediaStats);
  const filterList = (list: FounderModuleDef[]) =>
    permsLoading || isHiddenOwner ? list : list.filter((m) => canAccessRoute(m.to));
  const modules = useMemo(
    () => ({
      core: filterList(rawModules.core),
      tools: filterList(rawModules.tools),
      system: filterList(rawModules.system),
    }),
    [rawModules, canAccessRoute, permsLoading, isHiddenOwner],
  );

  return (
    <MissionControlShell
      toolbarActive="home"
      toolbarBadges={{ approvals: dash.pendingApprovals, alerts: dash.criticalAlerts }}
    >
      <PlatformPremiumStyles />
      <FounderControlHeader alertCount={alertCount} onOpenModules={() => setModulesOpen(true)} />
      <FounderModulesSheet open={modulesOpen} onOpenChange={setModulesOpen} />

      <FounderMissionControlHome
        dash={dash}
        mediaStats={mediaStats}
        mediaLoading={mediaLoading}
        onMediaReload={() => setMediaReloadKey((k) => k + 1)}
      />

      <FounderSectionNav />

      <FounderModuleSection id="founder-core-ops" title="Core Operations" modules={modules.core} />
      <FounderModuleSection id="founder-tools" title="Tools & Analytics" modules={modules.tools} />
      <FounderModuleSection id="founder-system" title="System" modules={modules.system} />
      <FounderEmergencyModuleCard to="/platform/emergency" />
    </MissionControlShell>
  );
}
