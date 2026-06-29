import { supabase } from "@/integrations/supabase/client";
import { PLATFORM_MODULE_KEYS, type PlatformModuleKey, type PlatformModuleRow } from "./types";
import { OWNER_MODULE_DEFAULTS } from "./owner-module-defaults";

const DEFAULT_LABELS = new Map(OWNER_MODULE_DEFAULTS.map((m) => [m.key, m]));

const CACHE_KEY = "ab:platform-modules-public-v6";
const LEGACY_CACHE_KEYS = [
  "ab:platform-modules-public",
  "ab:platform-modules-public-v2",
  "ab:platform-modules-public-v3",
  "ab:platform-modules-public-v4",
  "ab:platform-modules-public-v5",
] as const;

type ModuleCacheBlob = { at: number; rows: PlatformModuleRow[] };

/** Reserved for routes that must ignore owner toggles (empty — all modules respect owner state). */
export const ALWAYS_ENABLED_MODULE_KEYS = new Set<PlatformModuleKey>();

const DEFAULT_MODULES: PlatformModuleRow[] = OWNER_MODULE_DEFAULTS.map((m) => ({
  key: m.key,
  label: m.label,
  labelAr: m.labelAr,
  enabled: m.enabled,
}));

let memoryCache: PlatformModuleRow[] | null = null;

/** Ensures every known module key exists — stale caches missing new keys stay enabled. */
export function mergePlatformModulesWithDefaults(rows: PlatformModuleRow[]): PlatformModuleRow[] {
  const byKey = new Map(rows.map((row) => [row.key, row]));
  return PLATFORM_MODULE_KEYS.map((key) => {
    const remote = byKey.get(key);
    const fallback = DEFAULT_LABELS.get(key);
    return {
      key,
      label: fallback?.label ?? remote?.label ?? key,
      labelAr: fallback?.labelAr ?? remote?.labelAr ?? key,
      enabled: remote != null ? remote.enabled : (fallback?.enabled ?? false),
    };
  });
}

function readLocalCache(): PlatformModuleRow[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ModuleCacheBlob | PlatformModuleRow[];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.rows)) return parsed.rows;
    return null;
  } catch {
    return null;
  }
}

function writeLocalCache(rows: PlatformModuleRow[]) {
  if (typeof window === "undefined") return;
  try {
    const blob: ModuleCacheBlob = { at: Date.now(), rows };
    localStorage.setItem(CACHE_KEY, JSON.stringify(blob));
  } catch {
    /* ignore */
  }
}

export function getCachedPlatformModules(): PlatformModuleRow[] {
  const raw = memoryCache ?? readLocalCache() ?? DEFAULT_MODULES;
  return mergePlatformModulesWithDefaults(raw);
}

export async function fetchPlatformModulesPublic(): Promise<PlatformModuleRow[]> {
  const { data: rpcData, error: rpcError } = await supabase.rpc("platform_fetch_modules");
  if (!rpcError && rpcData != null) {
    const rpcRows = Array.isArray(rpcData) ? rpcData : [rpcData];
    if (rpcRows.length > 0) {
      const rows = mergePlatformModulesWithDefaults(
        rpcRows.map((r) => {
          const row = r as { key: string; label: string; label_ar: string; enabled: unknown };
          return {
            key: row.key as PlatformModuleKey,
            label: row.label,
            labelAr: row.label_ar,
            enabled: row.enabled === true,
          };
        }),
      );
      memoryCache = rows;
      writeLocalCache(rows);
      return rows;
    }
  }

  const { data, error } = await supabase
    .from("platform_modules")
    .select("key, label, label_ar, enabled")
    .order("key");

  if (error || !data?.length) {
    console.warn("[platform-modules] fetch failed", error?.message ?? rpcError?.message);
    return getCachedPlatformModules();
  }

  const rows = mergePlatformModulesWithDefaults(
    data.map((r) => ({
      key: r.key as PlatformModuleKey,
      label: r.label,
      labelAr: r.label_ar,
      enabled: r.enabled === true,
    })),
  );

  memoryCache = rows;
  writeLocalCache(rows);
  return rows;
}

export function isModuleEnabledInList(
  modules: PlatformModuleRow[],
  key: PlatformModuleKey,
  { optimisticWhileLoading = false }: { optimisticWhileLoading?: boolean } = {},
): boolean {
  if (ALWAYS_ENABLED_MODULE_KEYS.has(key)) return true;
  if (optimisticWhileLoading) return true;
  const merged = mergePlatformModulesWithDefaults(modules);
  const row = merged.find((m) => m.key === key);
  return row?.enabled === true;
}

/** Clears stale module caches that can block newly shipped routes (e.g. kholagy). */
export function purgeLegacyPlatformModuleCaches() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_CACHE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  memoryCache = null;
}

/** Force-refresh module flags from Supabase (call on app boot / tab focus). */
export async function syncPlatformModulesFromServer(): Promise<PlatformModuleRow[]> {
  const rows = await fetchPlatformModulesPublic();
  notifyPlatformModulesChanged();
  return rows;
}

export function patchCachedPlatformModule(key: PlatformModuleKey, enabled: boolean) {
  const current = getCachedPlatformModules();
  const next = current.map((m) => (m.key === key ? { ...m, enabled } : m));
  memoryCache = next;
  writeLocalCache(next);
}

/** Replace the full public module cache (after owner batch save). */
export function replacePlatformModulesCache(rows: PlatformModuleRow[]) {
  const merged = mergePlatformModulesWithDefaults(rows);
  memoryCache = merged;
  writeLocalCache(merged);
}

export function notifyPlatformModulesChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ab:platform-modules"));
}
