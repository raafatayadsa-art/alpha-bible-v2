import { getAuthUserSync } from "./auth-context";
import { useAlphaAuth } from "./auth-context";

/** Arabic toast / banner when a signed-in feature is blocked. */
export const LOGIN_REQUIRED_AR = "سجّل الدخول للاستفادة من هذه الميزة";

/** Sync check — safe in localStorage writers and non-React code. */
export function isLoggedInSync(): boolean {
  return !!getAuthUserSync()?.id;
}

/** Personal data: saves, highlights, journal, profile, community cards. */
export function canUsePersonalFeaturesSync(): boolean {
  return isLoggedInSync();
}

export function useCanUsePersonalFeatures(): boolean {
  const { isAuthenticated, loading } = useAlphaAuth();
  return !loading && isAuthenticated;
}
