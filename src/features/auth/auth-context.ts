import { useCallback, useEffect, useState } from "react";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { supabase } from "@/integrations/supabase/client";
import { fetchAuthUser, type AlphaAuthUser } from "./alpha-auth";
import {
  alphaRoleToChurchRole,
  resolveAlphaRoleContext,
  roleLabelFromContext,
  type AlphaRole,
  type AlphaRoleContext,
} from "./alpha-roles";
import {
  isPlaceholderAvatarUrl,
  syncLocalProfileAvatarFromCloud,
} from "@/features/profile/profile-user-store";
import { handleAuthUserTransition } from "./user-data-isolation";
import { ensureGuestSessionHygiene, clearGuestMode } from "./guest-mode";

export const AUTH_CONTEXT_EVENT = "ab:auth-context";

let cachedUser: AlphaAuthUser | null = null;
let cachedRoleContext: AlphaRoleContext = {
  role: "guest",
  isPlatformOwner: false,
  churchId: null,
  churchShieldRole: null,
  platformShieldRole: null,
  displayShieldRole: null,
  platformOwnerLabel: null,
  adminTeamRole: null,
};
let refreshPromise: Promise<void> | null = null;

function emitAuthContext() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CONTEXT_EVENT));
}

export function getAuthUserSync(): AlphaAuthUser | null {
  return cachedUser;
}

export function getAlphaRoleSync(): AlphaRole {
  return cachedRoleContext.role;
}

export function getAlphaRoleContextSync(): AlphaRoleContext {
  return cachedRoleContext;
}

export function isPlatformOwnerSync(): boolean {
  return cachedRoleContext.isPlatformOwner;
}

export function getChurchShieldRoleSync(): ShieldRole | null {
  return cachedRoleContext.churchShieldRole;
}

export function getDisplayShieldRoleSync(): ShieldRole | null {
  return cachedRoleContext.displayShieldRole;
}

export function getRoleLabelSync(): string {
  return roleLabelFromContext(cachedRoleContext, cachedUser?.email ?? null);
}

export async function refreshAuthContext(): Promise<AlphaRoleContext> {
  if (refreshPromise) {
    await refreshPromise;
    return cachedRoleContext;
  }

  refreshPromise = (async () => {
    const user = await fetchAuthUser();
    const nextUserId = user?.id ?? null;
    handleAuthUserTransition(nextUserId);
    if (nextUserId) {
      clearGuestMode();
    } else {
      ensureGuestSessionHygiene();
    }
    cachedUser = user;
    if (user) {
      if (user.avatarUrl && !isPlaceholderAvatarUrl(user.avatarUrl)) {
        syncLocalProfileAvatarFromCloud(user.avatarUrl);
      }
    }
    cachedRoleContext = await resolveAlphaRoleContext(user?.id ?? null, user?.email ?? null);
    emitAuthContext();
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }

  return cachedRoleContext;
}

export async function initAuth(): Promise<void> {
  await refreshAuthContext();
}

export function subscribeAuthContext(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onAuth = () => listener();
  window.addEventListener(AUTH_CONTEXT_EVENT, onAuth);
  return () => window.removeEventListener(AUTH_CONTEXT_EVENT, onAuth);
}

export function useAlphaAuth() {
  const [user, setUser] = useState<AlphaAuthUser | null>(() => getAuthUserSync());
  const [roleContext, setRoleContext] = useState<AlphaRoleContext>(() => getAlphaRoleContextSync());
  const [loading, setLoading] = useState(() => !cachedUser && cachedRoleContext.role === "guest");

  const sync = useCallback(async () => {
    setLoading(true);
    try {
      const timeoutMs = 8000;
      await Promise.race([
        refreshAuthContext(),
        new Promise<void>((_, reject) => {
          window.setTimeout(() => reject(new Error("auth-timeout")), timeoutMs);
        }),
      ]);
    } catch {
      /* fail-open — keep app usable on slow/offline mobile */
    } finally {
      setUser(getAuthUserSync());
      setRoleContext(getAlphaRoleContextSync());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void sync();
    });
    const off = subscribeAuthContext(() => {
      setUser(getAuthUserSync());
      setRoleContext(getAlphaRoleContextSync());
    });
    return () => {
      sub.subscription.unsubscribe();
      off();
    };
  }, [sync]);

  return {
    user,
    role: roleContext.role,
    roleContext,
    churchRole: alphaRoleToChurchRole(roleContext.role),
    loading,
    refresh: sync,
    isAuthenticated: !!user,
    isPlatformOwner: roleContext.isPlatformOwner,
  };
}

/** Invisible bootstrap — mount once in root (no UI). */
export function AuthBootstrap() {
  useEffect(() => {
    void initAuth();

    const refresh = () => {
      void refreshAuthContext();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void supabase.auth.getSession().then(() => refresh());
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);
  return null;
}
