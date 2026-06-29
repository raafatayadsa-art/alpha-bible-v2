import { useCallback, useEffect, useState } from "react";
import {
  fetchPlatformModulesPublic,
  getCachedPlatformModules,
  isModuleEnabledInList,
  purgeLegacyPlatformModuleCaches,
} from "./platform-modules-client";
import type { PlatformModuleKey, PlatformModuleRow } from "./types";

export function usePlatformModules() {
  const [modules, setModules] = useState<PlatformModuleRow[]>(() => getCachedPlatformModules());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const rows = await fetchPlatformModulesPublic();
      setModules(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const syncFromCache = () => {
      setModules(getCachedPlatformModules());
    };
    purgeLegacyPlatformModuleCaches();
    window.addEventListener("ab:platform-modules", syncFromCache);
    window.addEventListener("ab:mc-store", syncFromCache);
    return () => {
      window.removeEventListener("ab:platform-modules", syncFromCache);
      window.removeEventListener("ab:mc-store", syncFromCache);
    };
  }, [refresh]);

  const isModuleEnabled = useCallback(
    (key: PlatformModuleKey) => isModuleEnabledInList(modules, key),
    [modules],
  );

  return { modules, loading, isModuleEnabled, refresh };
}
