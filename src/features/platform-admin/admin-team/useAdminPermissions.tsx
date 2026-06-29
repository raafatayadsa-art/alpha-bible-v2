import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAuthUserSync, isFounderEmail, isPlatformOwnerSync, refreshAuthContext, subscribeAuthContext } from "@/features/auth";
import { isOwnerSessionActive } from "../owner-access-store";
import { checkIsPlatformOwnerRpc } from "../platform-owner-api";
import { fetchMyAdminPermissions } from "./admin-team-api";
import type { AdminPermissionKey } from "./permissions";
import { routeRequiresPermission } from "./permissions";

type AdminPermissionsContextValue = {
  loading: boolean;
  permissions: Set<AdminPermissionKey>;
  isHiddenOwner: boolean;
  has: (key: AdminPermissionKey) => boolean;
  canAccessRoute: (path: string) => boolean;
  refresh: () => Promise<void>;
};

const AdminPermissionsContext = createContext<AdminPermissionsContextValue | null>(null);

export function AdminPermissionsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<AdminPermissionKey[]>([]);
  const [isHiddenOwner, setIsHiddenOwner] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    await refreshAuthContext();
    const pinSession = isOwnerSessionActive();
    const email = getAuthUserSync()?.email ?? null;
    const founderByEmail = isFounderEmail(email);
    const owner =
      pinSession ||
      (founderByEmail && (isPlatformOwnerSync() || (await checkIsPlatformOwnerRpc())));
    setIsHiddenOwner(owner);
    if (owner) {
      const { ADMIN_PERMISSION_KEYS } = await import("./permissions");
      setPermissions([...ADMIN_PERMISSION_KEYS]);
    } else {
      const keys = await fetchMyAdminPermissions();
      setPermissions(keys);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const onOwnerAccess = () => void refresh();
    const onAdminRefresh = () => void refresh();
    window.addEventListener("ab:owner-access", onOwnerAccess);
    window.addEventListener("ab:admin-permissions", onAdminRefresh);
    const unsubAuth = subscribeAuthContext(() => {
      void refresh();
    });
    return () => {
      window.removeEventListener("ab:owner-access", onOwnerAccess);
      window.removeEventListener("ab:admin-permissions", onAdminRefresh);
      unsubAuth();
    };
  }, [refresh]);

  const permSet = useMemo(() => new Set(permissions), [permissions]);

  const value = useMemo<AdminPermissionsContextValue>(
    () => ({
      loading,
      permissions: permSet,
      isHiddenOwner,
      has: (key) => isHiddenOwner || permSet.has(key),
      canAccessRoute: (path) => {
        if (isHiddenOwner) return true;
        const req = routeRequiresPermission(path);
        if (req == null) return true;
        if (Array.isArray(req)) return req.some((k) => permSet.has(k));
        return permSet.has(req);
      },
      refresh,
    }),
    [loading, permSet, isHiddenOwner, refresh],
  );

  return (
    <AdminPermissionsContext.Provider value={value}>{children}</AdminPermissionsContext.Provider>
  );
}

export function useAdminPermissions() {
  const ctx = useContext(AdminPermissionsContext);
  if (!ctx) {
    const ownerBypass = isPlatformOwnerSync() || isOwnerSessionActive();
    return {
      loading: false,
      permissions: new Set<AdminPermissionKey>(),
      isHiddenOwner: ownerBypass,
      has: (_key: AdminPermissionKey) => ownerBypass,
      canAccessRoute: (_path: string) => ownerBypass,
      refresh: async () => {},
    };
  }
  return ctx;
}

export function notifyAdminPermissionsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ab:admin-permissions"));
}
