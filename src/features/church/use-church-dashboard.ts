import { useCallback, useEffect, useState } from "react";
import {
  fetchChurchDashboard,
  type ChurchDashboardData,
} from "./church-dashboard-api";

export function useChurchDashboard() {
  const [data, setData] = useState<ChurchDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchChurchDashboard();
      setData(next);
    } catch (e) {
      console.error("useChurchDashboard", e);
      setError("تعذّر تحميل بيانات الكنيسة");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onHub = () => void refresh();
    window.addEventListener("ab:church-hub", onHub);
    window.addEventListener("storage", onHub);
    return () => {
      window.removeEventListener("ab:church-hub", onHub);
      window.removeEventListener("storage", onHub);
    };
  }, [refresh]);

  return {
    data,
    loading,
    error,
    hasChurch: !!data,
    refresh,
  };
}
