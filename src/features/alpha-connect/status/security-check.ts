import { getAuthUserSync, subscribeAuthContext } from "@/features/auth/auth-context";
import { supabase } from "@/integrations/supabase/client";
import type { SecurityEncryptionState, SecurityStatusState } from "./types";

const SECURITY_LABELS: Record<SecurityEncryptionState, string> = {
  encrypted: "مشفّر",
  warning: "تحذير",
  offline: "غير متصل",
};

function isHttpsActive(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:" || window.location.hostname === "localhost";
}

async function checkSupabaseAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const { error } = await supabase
      .from("alpha_user_presence")
      .select("user_id")
      .limit(1)
      .abortSignal(controller.signal);
    window.clearTimeout(timeout);
    return !error;
  } catch {
    return false;
  }
}

async function checkAuthSession(): Promise<{ sessionValid: boolean; authenticated: boolean }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return { sessionValid: false, authenticated: false };
    }

    const expiresAt = data.session.expires_at;
    const sessionValid =
      !expiresAt || expiresAt * 1000 > Date.now() + 5_000;
    const authenticated = sessionValid && Boolean(data.session.user?.id);
    return { sessionValid, authenticated };
  } catch {
    return { sessionValid: false, authenticated: false };
  }
}

function deriveSecurityState(input: {
  online: boolean;
  https: boolean;
  supabaseAvailable: boolean;
  sessionValid: boolean;
  authenticated: boolean;
}): SecurityEncryptionState {
  if (!input.online || !input.supabaseAvailable) return "offline";
  if (input.https && input.sessionValid && input.authenticated) return "encrypted";
  return "warning";
}

export async function readSecurityStatusState(online = typeof navigator !== "undefined" ? navigator.onLine : false): Promise<SecurityStatusState> {
  const https = isHttpsActive();
  const supabaseAvailable = online ? await checkSupabaseAvailable() : false;
  const { sessionValid, authenticated } = online ? await checkAuthSession() : { sessionValid: false, authenticated: false };

  const syncedUser = getAuthUserSync();
  const authenticatedFinal = authenticated && Boolean(syncedUser?.id);

  const state = deriveSecurityState({
    online,
    https,
    supabaseAvailable,
    sessionValid,
    authenticated: authenticatedFinal,
  });

  return {
    state,
    label: SECURITY_LABELS[state],
    https,
    supabaseAvailable,
    sessionValid,
    authenticated: authenticatedFinal,
  };
}

export function bindSecurityListeners(onChange: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange(() => onChange());
  const removeAuthContext = subscribeAuthContext(onChange);
  return () => {
    data.subscription.unsubscribe();
    removeAuthContext();
  };
}

export { SECURITY_LABELS };
