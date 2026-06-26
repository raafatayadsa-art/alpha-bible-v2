import type { ReactNode } from "react";
import type { PlatformModuleKey } from "./types";
import { usePlatformModules } from "./usePlatformModules";

/** Renders children only while the platform module is enabled. */
export function ModuleGate({
  moduleKey,
  children,
  fallback = null,
}: {
  moduleKey: PlatformModuleKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isModuleEnabled, loading } = usePlatformModules();
  if (loading) return null;
  if (!isModuleEnabled(moduleKey)) return fallback;
  return <>{children}</>;
}
