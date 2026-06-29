import { useEffect } from "react";
import {
  purgeLegacyPlatformModuleCaches,
  syncPlatformModulesFromServer,
} from "./platform-modules-client";
import { subscribePlatformSync } from "@/features/platform-admin/platform-control-sync";
import { startPlatformRealtimeBridge } from "@/features/platform-admin/platform-realtime-bridge";

const REFRESH_MS = 45_000;

/** Keeps platform module locks in sync on mobile (focus + interval + realtime). */
export function PlatformModulesBootstrap() {
  useEffect(() => {
    purgeLegacyPlatformModuleCaches();

    const pull = () => {
      void syncPlatformModulesFromServer();
    };

    pull();

    const onVisible = () => {
      if (document.visibilityState === "visible") pull();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", pull);
    const timer = window.setInterval(pull, REFRESH_MS);
    const unsubSync = subscribePlatformSync(() => pull());
    const stopRealtime = startPlatformRealtimeBridge();

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", pull);
      window.clearInterval(timer);
      unsubSync();
      stopRealtime();
    };
  }, []);

  return null;
}
