import { useCallback, useEffect, useState } from "react";
import type { ScanAuditMeta } from "./scan-store";
import {
  ensureModulesSeededDb,
  fetchAuditLog,
  fetchEmergency,
  fetchModules,
  insertAuditDb,
  patchEmergencyDb,
  toggleModuleDb,
  saveModulesDb,
} from "./platform-api";
import { broadcastPlatformLiveUpdate } from "./platform-control-sync";
import {
  fetchPlatformModulesPublic,
  getCachedPlatformModules,
  mergeOwnerModuleStates,
  notifyPlatformModulesChanged,
  OWNER_MODULE_DEFAULTS,
  patchCachedPlatformModule,
  replacePlatformModulesCache,
  syncPlatformModulesFromServer,
} from "@/lib/platform-modules";

/** Supabase-inspired Owner Control palette — black surfaces, neon green primary. */
export const MC = {
  bg: "#000000",
  midnight: "#000000",
  panel: "#1C1C1E",
  panelBorder: "rgba(255, 255, 255, 0.06)",
  primary: "#34C759",
  purple: "#BF5AF2",
  gold: "#34C759",
  white: "#FFFFFF",
  green: "#34C759",
  greenBright: "#30D158",
  red: "#FF375F",
  blue: "#0A84FF",
  steel: "#8E8E93",
  cyan: "#0A84FF",
  electric: "#0A84FF",
  amber: "#FF9F0A",
  pink: "#FF375F",
  text: "#FFFFFF",
  muted: "#8E8E93",
  grid: "rgba(52, 199, 89, 0.03)",
} as const;

export const PLATFORM_STATS = {
  users: 0,
  usersDelta: "",
  churches: 0,
  churchesDelta: "",
  priests: 0,
  priestsDelta: "",
  servants: 0,
  servantsDelta: "",
} as const;

export type PlatformModuleKey =
  | "bible"
  | "agpeya"
  | "kholagy"
  | "synaxarium"
  | "katameros"
  | "audio"
  | "kids"
  | "meditations"
  | "community"
  | "messaging"
  | "trips"
  | "reservations"
  | "donations";

export type ModuleState = { key: PlatformModuleKey; label: string; labelAr: string; enabled: boolean };

export type AuditLogEntry = {
  id: string;
  action: string;
  admin: string;
  reason: string;
  timestamp: number;
  scanMeta?: ScanAuditMeta;
};

export type EmergencyFlags = {
  maintenance: boolean;
  disableRegistration: boolean;
  disableMessaging: boolean;
  disableCommunity: boolean;
  lockdown: boolean;
};

const MODULES_KEY = "ab:mc-modules";
const AUDIT_KEY = "ab:mc-audit";
const EMERGENCY_KEY = "ab:mc-emergency";

const DEFAULT_MODULES = OWNER_MODULE_DEFAULTS;

const DEFAULT_AUDIT: AuditLogEntry[] = [];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    if (Array.isArray(fallback)) return JSON.parse(raw) as T;
    return { ...(fallback as object), ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ab:mc-store"));
  } catch { /* ignore */ }
}

function readModulesCache(): ModuleState[] {
  const raw = readJson<ModuleState[]>(MODULES_KEY, DEFAULT_MODULES);
  return mergeOwnerModuleStates(Array.isArray(raw) ? raw : DEFAULT_MODULES);
}

function modulesFromPublicCache(): ModuleState[] {
  return mergeOwnerModuleStates(
    getCachedPlatformModules().map((m) => ({
      key: m.key,
      label: m.label,
      labelAr: m.labelAr,
      enabled: m.enabled,
    })),
  );
}

function persistModules(next: ModuleState[]) {
  writeJson(MODULES_KEY, next);
  replacePlatformModulesCache(
    next.map((m) => ({
      key: m.key,
      label: m.label,
      labelAr: m.labelAr,
      enabled: m.enabled,
    })),
  );
}

export function usePlatformStore() {
  const [modules, setModules] = useState<ModuleState[]>(() => readModulesCache());
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => readJson(AUDIT_KEY, DEFAULT_AUDIT));
  const [emergency, setEmergency] = useState<EmergencyFlags>(() =>
    readJson(EMERGENCY_KEY, {
      maintenance: false,
      disableRegistration: false,
      disableMessaging: false,
      disableCommunity: false,
      lockdown: false,
    }),
  );
  const [dbSynced, setDbSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureModulesSeededDb();
      const [remoteModules, remoteAudit, remoteEmergency] = await Promise.all([
        fetchModules(),
        fetchAuditLog(),
        fetchEmergency(),
      ]);
      if (cancelled) return;
      if (remoteModules?.length) {
        const merged = mergeOwnerModuleStates(remoteModules);
        setModules(merged);
        persistModules(merged);
        setDbSynced(true);
      } else {
        setModules((prev) => mergeOwnerModuleStates(prev));
      }
      if (remoteAudit?.length) {
        setAuditLog(remoteAudit);
        writeJson(AUDIT_KEY, remoteAudit);
      }
      if (remoteEmergency) {
        setEmergency(remoteEmergency);
        writeJson(EMERGENCY_KEY, remoteEmergency);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncMcStore = () => {
      setModules(readModulesCache());
      setAuditLog(readJson(AUDIT_KEY, DEFAULT_AUDIT));
      setEmergency(
        readJson(EMERGENCY_KEY, {
          maintenance: false,
          disableRegistration: false,
          disableMessaging: false,
          disableCommunity: false,
          lockdown: false,
        }),
      );
    };
    const syncFromPublicModules = () => {
      const merged = modulesFromPublicCache();
      setModules(merged);
      persistModules(merged);
    };
    window.addEventListener("ab:mc-store", syncMcStore);
    window.addEventListener("ab:platform-modules", syncFromPublicModules);
    return () => {
      window.removeEventListener("ab:mc-store", syncMcStore);
      window.removeEventListener("ab:platform-modules", syncFromPublicModules);
    };
  }, []);

  const toggleModule = useCallback(async (key: PlatformModuleKey): Promise<boolean> => {
    const target = modules.find((m) => m.key === key);
    if (!target) return false;
    const nextEnabled = !target.enabled;
    const prevEnabled = target.enabled;

    const applyLocal = (enabled: boolean) => {
      setModules((prev) => {
        const next = prev.map((m) => (m.key === key ? { ...m, enabled } : m));
        writeJson(MODULES_KEY, next);
        return next;
      });
      patchCachedPlatformModule(key, enabled);
      notifyPlatformModulesChanged();
    };

    applyLocal(nextEnabled);

    const ok = await toggleModuleDb(key, nextEnabled);
    if (!ok) {
      applyLocal(prevEnabled);
      return false;
    }

    await fetchPlatformModulesPublic();
    notifyPlatformModulesChanged();
    broadcastPlatformLiveUpdate();
    return true;
  }, [modules]);

  const patchEmergency = useCallback((patch: Partial<EmergencyFlags>) => {
    setEmergency((prev) => {
      const next = { ...prev, ...patch };
      writeJson(EMERGENCY_KEY, next);
      void patchEmergencyDb(patch).then((ok) => {
        if (ok) broadcastPlatformLiveUpdate();
      });
      return next;
    });
  }, []);

  const addAudit = useCallback((action: string, reason: string, scanMeta?: ScanAuditMeta) => {
    void (async () => {
      const remote = await insertAuditDb(action, reason, scanMeta);
      setAuditLog((prev) => {
        const entry: AuditLogEntry =
          remote ?? {
            id: String(Date.now()),
            action,
            admin: "Owner",
            reason,
            timestamp: Date.now(),
            scanMeta,
          };
        const next = [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, 100);
        writeJson(AUDIT_KEY, next);
        return next;
      });
    })();
  }, []);

  const refreshAuditLog = useCallback(async (): Promise<boolean> => {
    const remote = await fetchAuditLog();
    if (remote === null) return false;
    setAuditLog(remote);
    writeJson(AUDIT_KEY, remote);
    return true;
  }, []);

  const saveModules = useCallback(async (draft: ModuleState[]): Promise<{ ok: boolean; error?: string }> => {
    const baseline = readModulesCache();
    const changes = draft.filter((d) => {
      const current = baseline.find((m) => m.key === d.key);
      return current != null && current.enabled !== d.enabled;
    });
    if (!changes.length) return { ok: true };

    await ensureModulesSeededDb();

    const result = await saveModulesDb(
      changes.map((c) => ({ key: c.key, enabled: c.enabled })),
    );
    if (!result.ok) {
      console.warn("[platform-modules] save failed for", result.failed, result.error);
      return { ok: false, error: result.error };
    }

    const merged = mergeOwnerModuleStates(draft);
    setModules(merged);
    persistModules(merged);
    notifyPlatformModulesChanged();
    void syncPlatformModulesFromServer();
    broadcastPlatformLiveUpdate();

    return { ok: true };
  }, []);

  return { modules, auditLog, emergency, toggleModule, saveModules, patchEmergency, addAudit, refreshAuditLog, dbSynced };
}
