import { refreshAuthContext } from "@/features/auth";
import {
  mergeOwnerModuleStates,
  notifyPlatformModulesChanged,
  syncPlatformModulesFromServer,
} from "@/lib/platform-modules";
import { notifyAdminPermissionsChanged } from "./admin-team/useAdminPermissions";
import {
  fetchAuditLog,
  fetchEmergency,
  fetchModules,
  fetchPlatformSettings,
  patchEmergencyDb,
  patchPlatformSettingsDb,
  resetPlatformDbReadyCache,
  saveModulesDb,
  type PlatformSettings,
} from "./platform-api";
import type { EmergencyFlags, ModuleState, PlatformModuleKey } from "./platform-store";

export const PLATFORM_SYNC_EVENT = "ab:platform-sync";

export type PlatformSyncResult = {
  ok: boolean;
  modules: boolean;
  emergency: boolean;
  audit: boolean;
  settings: boolean;
  at: number;
};

let syncPromise: Promise<PlatformSyncResult> | null = null;

function readLocalJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function emitPlatformSync(detail: PlatformSyncResult) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PLATFORM_SYNC_EVENT, { detail }));
  window.dispatchEvent(new CustomEvent("ab:mc-store"));
  notifyPlatformModulesChanged();
  notifyAdminPermissionsChanged();
}

/** Broadcast after any admin save so all clients refresh instantly. */
export function broadcastPlatformLiveUpdate(): void {
  emitPlatformSync({
    ok: true,
    modules: true,
    emergency: true,
    audit: true,
    settings: true,
    at: Date.now(),
  });
}

/** Push local owner-control state to Supabase before pulling remote. */
async function pushLocalPlatformStateToDb(): Promise<void> {
  const localModules = readLocalJson<ModuleState[]>("ab:mc-modules");
  if (localModules?.length) {
    const remote = await fetchModules();
    const remoteMap = new Map((remote ?? []).map((m) => [m.key, m.enabled]));
    const changes = localModules
      .filter((m) => remoteMap.has(m.key as PlatformModuleKey) && remoteMap.get(m.key as PlatformModuleKey) !== m.enabled)
      .map((m) => ({ key: m.key as PlatformModuleKey, enabled: m.enabled }));
    if (changes.length) await saveModulesDb(changes);
  }

  const localEmergency = readLocalJson<EmergencyFlags>("ab:mc-emergency");
  if (localEmergency) await patchEmergencyDb(localEmergency);

  const localSettings = readLocalJson<PlatformSettings>("ab:mc-platform-settings");
  if (localSettings) await patchPlatformSettingsDb(localSettings);
}

/** Two-way sync: push local edits → pull remote → broadcast to every subscriber. */
export async function syncPlatformControlAll(): Promise<PlatformSyncResult> {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    resetPlatformDbReadyCache();

    const result: PlatformSyncResult = {
      ok: true,
      modules: false,
      emergency: false,
      audit: false,
      settings: false,
      at: Date.now(),
    };

    try {
      await pushLocalPlatformStateToDb();
      await refreshAuthContext();

      const [remoteModules, remoteEmergency, remoteAudit, remoteSettings] = await Promise.all([
        fetchModules(),
        fetchEmergency(),
        fetchAuditLog(),
        fetchPlatformSettings(),
      ]);

      if (remoteModules?.length) {
        const merged = mergeOwnerModuleStates(remoteModules);
        if (typeof window !== "undefined") {
          localStorage.setItem("ab:mc-modules", JSON.stringify(merged));
        }
        await syncPlatformModulesFromServer();
        result.modules = true;
      } else {
        await syncPlatformModulesFromServer();
        result.modules = true;
      }

      if (remoteEmergency && typeof window !== "undefined") {
        localStorage.setItem("ab:mc-emergency", JSON.stringify(remoteEmergency));
        result.emergency = true;
      }

      if (remoteAudit && typeof window !== "undefined") {
        localStorage.setItem("ab:mc-audit", JSON.stringify(remoteAudit));
        result.audit = true;
      }

      if (remoteSettings && typeof window !== "undefined") {
        localStorage.setItem("ab:mc-platform-settings", JSON.stringify(remoteSettings));
        result.settings = true;
      }

      emitPlatformSync(result);
    } catch (err) {
      console.warn("[platform-sync]", err);
      result.ok = false;
      emitPlatformSync(result);
    }

    return result;
  })().finally(() => {
    syncPromise = null;
  });

  return syncPromise;
}

export function subscribePlatformSync(listener: (detail: PlatformSyncResult) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<PlatformSyncResult>).detail;
    if (detail) listener(detail);
  };
  window.addEventListener(PLATFORM_SYNC_EVENT, handler);
  return () => window.removeEventListener(PLATFORM_SYNC_EVENT, handler);
}
