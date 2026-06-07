import { useEffect, useState } from "react";
import { useApprovalsCenter } from "./approvals-store";
import { PLATFORM_STATS } from "./platform-store";
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
  }, [pendingCount]);

  const users = stats?.users ?? PLATFORM_STATS.users;
  const churches = stats?.churches ?? PLATFORM_STATS.churches;
  const priests = stats?.priests ?? PLATFORM_STATS.priests;
  const servants = stats?.servants ?? PLATFORM_STATS.servants;

  return {
    loading,
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
      churchesLabel: String(churches),
      priestsLabel: String(priests),
      servantsLabel: formatCount(servants),
      messages: stats?.messages ?? 0,
      requests: stats?.requests ?? pendingCount,
      reports: stats?.reports ?? summary.reports,
    },
    summary,
  };
}
