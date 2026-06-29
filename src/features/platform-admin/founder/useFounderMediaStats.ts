import { useCallback, useEffect, useState } from "react";
import {
  fetchMediaManagerStats,
  type MediaManagerStats,
} from "../media-manager-api";

export function useFounderMediaStats(reloadKey = 0) {
  const [stats, setStats] = useState<MediaManagerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const next = await fetchMediaManagerStats();
    setStats(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, reloadKey]);

  return { stats, loading, reload };
}
