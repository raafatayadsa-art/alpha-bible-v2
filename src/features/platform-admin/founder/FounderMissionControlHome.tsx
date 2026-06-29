import { useState } from "react";
import type { MediaManagerStats } from "../media-manager-api";
import { usePlatformStore } from "../platform-store";
import type { usePlatformDashboard } from "../use-platform-dashboard";
import { DrillSheet, type DrillData } from "./DrillSheet";
import { FounderAlphaHealthPanel } from "./FounderAlphaHealthPanel";
import { FounderAttentionList } from "./FounderAttentionList";
import { FounderEmergencyBanner } from "./FounderEmergencyBanner";
import { FounderFeatureUsage } from "./FounderFeatureUsage";
import { FounderGlobalActivity } from "./FounderGlobalActivity";
import { FounderPlatformGrowth } from "./FounderPlatformGrowth";
import { FounderPlatformIndicators } from "./FounderPlatformIndicators";
import { FounderQuickTools } from "./FounderQuickTools";
import { FounderRecentActivity } from "./FounderRecentActivity";
import { FounderSmartInsights } from "./FounderSmartInsights";
import { FounderWelcomeCard } from "./FounderWelcomeCard";

type Dash = ReturnType<typeof usePlatformDashboard>;

export function FounderMissionControlHome({
  dash,
  mediaStats,
}: {
  dash: Dash;
  mediaStats: MediaManagerStats | null;
  mediaLoading?: boolean;
  onMediaReload?: () => void;
}) {
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillData, setDrillData] = useState<DrillData | null>(null);
  const { modules } = usePlatformStore();
  const modulesEnabled = modules.filter((m) => m.enabled).length;
  const modulesDisabled = modules.length - modulesEnabled;

  const openDrill = (data: DrillData) => {
    setDrillData(data);
    setDrillOpen(true);
  };

  return (
    <div className="mb-3">
      <FounderWelcomeCard dash={dash} />

      <FounderAlphaHealthPanel dash={dash} onDrill={openDrill} />
      <FounderPlatformIndicators dash={dash} onDrill={openDrill} />
      <FounderAttentionList dash={dash} mediaStats={mediaStats} />
      <FounderGlobalActivity dash={dash} onDrill={openDrill} />
      <FounderPlatformGrowth dash={dash} />
      <FounderQuickTools
        mediaPending={mediaStats?.pending}
        mediaStats={mediaStats}
        openReports={dash.stats.reports}
        modulesEnabled={modulesEnabled}
        modulesDisabled={modulesDisabled}
        modulesTotal={modules.length}
      />
      <FounderFeatureUsage dash={dash} />
      <FounderSmartInsights dash={dash} mediaPending={mediaStats?.pending} />
      <FounderRecentActivity />

      <FounderEmergencyBanner />

      <DrillSheet open={drillOpen} onOpenChange={setDrillOpen} data={drillData} />
    </div>
  );
}
