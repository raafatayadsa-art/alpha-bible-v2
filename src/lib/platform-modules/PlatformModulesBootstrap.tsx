import { useEffect } from "react";
import { purgeLegacyPlatformModuleCaches, syncPlatformModulesFromServer } from "./platform-modules-client";

const REFRESH_MS = 45_000;

/** Keeps platform module locks in sync on mobile (focus + interval). */
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

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", pull);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
