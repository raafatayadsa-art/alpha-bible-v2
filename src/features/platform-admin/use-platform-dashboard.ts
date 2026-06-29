import { useCallback, useEffect, useState } from "react";
import { useApprovalsCenter } from "./approvals-store";
import { subscribePlatformSync } from "./platform-control-sync";
import {
  fetchDashboardStats,
  fetchPlatformHealth,
  formatCount,
  type DashboardStats,
  type PlatformHealth,
} from "./platform-api";

export function usePlatformDashboard() {
  const { pendingCount, summary } = useApprovalsCenter();
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    return subscribePlatformSync(() => refresh());
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [h, s] = await Promise.all([fetchPlatformHealth(), fetchDashboardStats()]);
      if (cancelled) return;
      setHealth(h);
      setStats(s);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingCount, reloadTick]);

  const users = stats?.users ?? 0;
  const churches = stats?.churches ?? 0;
  const priests = stats?.priests ?? 0;
  const servants = stats?.servants ?? 0;

  return {
    loading,
    refresh,
    health,
    healthScore: health?.score ?? 98,
    pendingApprovals: pendingCount,
    criticalAlerts: summary.reports,
    stats: {
      users,
      churches,
      priests,
      servants,
      usersLabel: formatCount(users),
      churchesLabel: formatCount(churches),
      priestsLabel: formatCount(priests),
      servantsLabel: formatCount(servants),
      messages: stats?.messages ?? 0,
      requests: stats?.requests ?? pendingCount,
      reports: stats?.reports ?? summary.reports,
    },
    summary,
  };
}
