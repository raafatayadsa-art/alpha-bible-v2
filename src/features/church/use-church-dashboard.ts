import { useCallback, useEffect, useRef, useState } from "react";
import { AUTH_CONTEXT_EVENT } from "@/features/auth";
import {
  fetchChurchDashboard,
  fetchChurchProfileContext,
  resolveChurchHubDashboardAccess,
  type ChurchDashboardData,
  type ChurchProfileContext,
} from "./church-dashboard-api";
import { PRAYER_REQUESTS_CHANGED } from "./prayer-requests-api";

const EMPTY_PROFILE: ChurchProfileContext = {
  hasApprovedChurch: false,
  setupStatus: "none",
};

export function useChurchDashboard() {
  const [data, setData] = useState<ChurchDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<ChurchDashboardData | null>(null);
  dataRef.current = data;

  const refresh = useCallback(async () => {
    const hasCached = dataRef.current != null;
    if (!hasCached) setLoading(true);
    setError(null);
    try {
      const next = await fetchChurchDashboard();
      setData(next);
    } catch (e) {
      console.error("useChurchDashboard", e);
      setError("تعذّر تحميل بيانات الكنيسة");
      if (!hasCached) setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onHub = () => void refresh();
    const onPrayers = () => void refresh();
    window.addEventListener("ab:church-hub", onHub);
    window.addEventListener("storage", onHub);
    window.addEventListener(PRAYER_REQUESTS_CHANGED, onPrayers);
    return () => {
      window.removeEventListener("ab:church-hub", onHub);
      window.removeEventListener("storage", onHub);
      window.removeEventListener(PRAYER_REQUESTS_CHANGED, onPrayers);
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

export function useChurchProfile() {
  const [profile, setProfile] = useState<ChurchProfileContext>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchChurchProfileContext();
      setProfile(next);
    } catch (e) {
      console.error("[useChurchProfile] fetch failed", e);
      setError("تعذّر تحميل بيانات الكنيسة");
      setProfile(EMPTY_PROFILE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onHub = () => void refresh();
    const onAuth = () => void refresh();
    window.addEventListener("ab:church-hub", onHub);
    window.addEventListener("storage", onHub);
    window.addEventListener(AUTH_CONTEXT_EVENT, onAuth);
    return () => {
      window.removeEventListener("ab:church-hub", onHub);
      window.removeEventListener("storage", onHub);
      window.removeEventListener(AUTH_CONTEXT_EVENT, onAuth);
    };
  }, [refresh]);

  return { profile, loading, error, refresh };
}

/** /profile/church — direct membership + church gate (no setup_requests). */
export function useChurchHubDashboardAccess() {
  const [canOpenDashboard, setCanOpenDashboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await resolveChurchHubDashboardAccess();
      setCanOpenDashboard(next.canOpenDashboard);
    } catch (e) {
      console.error("[useChurchHubDashboardAccess] resolve failed", e);
      setError("تعذّر التحقق من صلاحية لوحة الكنيسة");
      setCanOpenDashboard(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onHub = () => void refresh();
    const onAuth = () => void refresh();
    window.addEventListener("ab:church-hub", onHub);
    window.addEventListener("storage", onHub);
    window.addEventListener(AUTH_CONTEXT_EVENT, onAuth);
    return () => {
      window.removeEventListener("ab:church-hub", onHub);
      window.removeEventListener("storage", onHub);
      window.removeEventListener(AUTH_CONTEXT_EVENT, onAuth);
    };
  }, [refresh]);

  return { canOpenDashboard, loading, error, refresh };
}
