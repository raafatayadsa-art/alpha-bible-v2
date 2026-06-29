import { supabase } from "@/integrations/supabase/client";
import { refreshAuthContext } from "./auth-context";
import {
  clearUserScopedLocalData,
  writeLastBoundAuthUserId,
} from "./user-data-isolation";
import { resetUserProgressSyncState } from "@/lib/user-progress-sync";

const GUEST_MODE_KEY = "alpha:guest-mode";
const GUEST_SESSION_KEY = "ab:guest-session-hygiene";

export function isGuestModeActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(GUEST_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearGuestMode(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_MODE_KEY);
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function markGuestSessionHygieneDone(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GUEST_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Wipe account-bound caches for an anonymous guest tab session. */
export function ensureGuestSessionHygiene(): void {
  if (typeof window === "undefined" || !isGuestModeActive()) return;
  try {
    if (sessionStorage.getItem(GUEST_SESSION_KEY) === "1") return;
  } catch {
    /* ignore */
  }
  clearUserScopedLocalData();
  resetUserProgressSyncState();
  writeLastBoundAuthUserId(null);
  markGuestSessionHygieneDone();
}

/** Browse the app without signing in — no profile data required. */
export async function enterGuestMode(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    /* ignore */
  }
  clearUserScopedLocalData();
  resetUserProgressSyncState();
  writeLastBoundAuthUserId(null);
  try {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    /* ignore */
  }
  localStorage.setItem(GUEST_MODE_KEY, "1");
  markGuestSessionHygieneDone();
  await refreshAuthContext();
}

export async function continueAsGuest(): Promise<void> {
  await enterGuestMode();
}
