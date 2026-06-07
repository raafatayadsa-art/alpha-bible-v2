import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAuthUser, type AlphaAuthUser } from "./alpha-auth";
import {
  alphaRoleToChurchRole,
  resolveAlphaRoleContext,
  type AlphaRole,
  type AlphaRoleContext,
} from "./alpha-roles";

export const AUTH_CONTEXT_EVENT = "ab:auth-context";

let cachedUser: AlphaAuthUser | null = null;
let cachedRoleContext: AlphaRoleContext = {
  role: "guest",
  isPlatformOwner: false,
  churchId: null,
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

export async function refreshAuthContext(): Promise<AlphaRoleContext> {
  if (refreshPromise) {
    await refreshPromise;
    return cachedRoleContext;
  }

  refreshPromise = (async () => {
    const user = await fetchAuthUser();
    cachedUser = user;
    cachedRoleContext = await resolveAlphaRoleContext(user?.id ?? null);
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
    const ctx = await refreshAuthContext();
    setUser(getAuthUserSync());
    setRoleContext(ctx);
    setLoading(false);
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
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void refreshAuthContext();
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}
