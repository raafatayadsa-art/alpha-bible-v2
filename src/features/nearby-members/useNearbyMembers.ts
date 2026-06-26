import { useCallback, useEffect, useState } from "react";
import {
  checkNearbyBackendReady,
  fetchNearbyMembers,
  geolocationErrorMessage,
  loadDiscoveryPrefs,
  requestCurrentPosition,
  saveDiscoveryPrefs,
  upsertDiscoveryLocation,
} from "./nearby-api";
import type { NearbyDiscoveryPrefs, NearbyMember } from "./types";
import { loadAlphaConnectSettings } from "@/components/alpha/AlphaConnectSettings";

export function useNearbyMembers() {
  const [members, setMembers] = useState<NearbyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState(true);
  const [discoverable, setDiscoverable] = useState(false);
  const [prefs, setPrefs] = useState<NearbyDiscoveryPrefs>({
    nearbyDiscoverable: false,
    whoCanDiscover: "church",
  });
  const [usingGps, setUsingGps] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const ready = await checkNearbyBackendReady();
    setBackendReady(ready.ready);
    if (!ready.ready) {
      setError(ready.error ?? null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const settings = loadAlphaConnectSettings();
    const remotePrefs = (await loadDiscoveryPrefs()) ?? {
      nearbyDiscoverable: settings.nearbyDiscoverable ?? false,
      whoCanDiscover: settings.whoCanDiscoverMe ?? "church",
    };
    setPrefs(remotePrefs);
    setDiscoverable(remotePrefs.nearbyDiscoverable);

    if (!remotePrefs.nearbyDiscoverable) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      const pos = await requestCurrentPosition();
      setUsingGps(true);
      await upsertDiscoveryLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyM: pos.coords.accuracy,
        discoverable: true,
      });
      const list = await fetchNearbyMembers({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setMembers(list);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setError(geolocationErrorMessage(err.code));
      } else {
        setError(err instanceof Error ? err.message : "تعذّر تحميل الأعضاء القريبين");
      }
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enableDiscovery = useCallback(async () => {
    const next: NearbyDiscoveryPrefs = { ...prefs, nearbyDiscoverable: true };
    await saveDiscoveryPrefs(next);
    setPrefs(next);
    setDiscoverable(true);
    await refresh();
  }, [prefs, refresh]);

  const disableDiscovery = useCallback(async () => {
    const next: NearbyDiscoveryPrefs = { ...prefs, nearbyDiscoverable: false };
    await saveDiscoveryPrefs(next);
    setPrefs(next);
    setDiscoverable(false);
    setMembers([]);
  }, [prefs]);

  return {
    members,
    loading,
    error,
    backendReady,
    discoverable,
    prefs,
    usingGps,
    refresh,
    enableDiscovery,
    disableDiscovery,
  };
}
