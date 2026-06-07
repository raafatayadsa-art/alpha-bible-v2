import { useCallback, useEffect, useState } from "react";
import type { ScanAuditMeta } from "./scan-store";
import {
  fetchAuditLog,
  fetchEmergency,
  fetchModules,
  insertAuditDb,
  patchEmergencyDb,
  toggleModuleDb,
} from "./platform-api";

/** Luxury Owner Control palette — isolated from Alpha Bible cream UI. */
export const MC = {
  bg: "#080c18",
  midnight: "#0f1628",
  panel: "linear-gradient(155deg, rgba(22, 30, 52, 0.92) 0%, rgba(10, 14, 26, 0.96) 100%)",
  panelBorder: "rgba(196, 165, 116, 0.14)",
  purple: "#8b7ab8",
  gold: "#c4a574",
  white: "#f5f0e8",
  green: "#4a8f6e",
  red: "#b85c58",
  blue: "#5a7aa8",
  steel: "#6b7a94",
  cyan: "#7a9ab8",
  electric: "#5a7aa8",
  amber: "#c4a574",
  text: "#f0ebe3",
  muted: "#8a94a8",
  grid: "rgba(139, 122, 184, 0.04)",
} as const;

export const PLATFORM_STATS = {
  users: 12458,
  usersDelta: "+125 today",
  churches: 356,
  churchesDelta: "+3 this week",
  priests: 125,
  priestsDelta: "+3 this week",
  servants: 1256,
  servantsDelta: "+18 today",
} as const;

export type PlatformModuleKey =
  | "bible"
  | "agpeya"
  | "synaxarium"
  | "katameros"
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

const DEFAULT_MODULES: ModuleState[] = [
  { key: "bible", label: "Bible", labelAr: "الكتاب المقدس", enabled: true },
  { key: "agpeya", label: "Agpeya", labelAr: "الأجبية", enabled: true },
  { key: "synaxarium", label: "Synaxarium", labelAr: "السنكسار", enabled: true },
  { key: "katameros", label: "Katameros", labelAr: "القطمارس", enabled: true },
  { key: "community", label: "Community", labelAr: "المجتمع", enabled: true },
  { key: "messaging", label: "Messaging", labelAr: "الرسائل", enabled: true },
  { key: "trips", label: "Trips", labelAr: "الرحلات", enabled: true },
  { key: "reservations", label: "Reservations", labelAr: "الحجوزات", enabled: false },
  { key: "donations", label: "Donations", labelAr: "التبرعات", enabled: true },
];

const DEFAULT_AUDIT: AuditLogEntry[] = [
  { id: "1", action: "اعتماد كنيسة", admin: "Owner", reason: "مستندات مكتملة", timestamp: Date.now() - 86400000 },
  { id: "2", action: "تعليق موديول", admin: "Owner", reason: "صيانة", timestamp: Date.now() - 172800000 },
];

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

export function usePlatformStore() {
  const [modules, setModules] = useState<ModuleState[]>(() => readJson(MODULES_KEY, DEFAULT_MODULES));
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
      const [remoteModules, remoteAudit, remoteEmergency] = await Promise.all([
        fetchModules(),
        fetchAuditLog(),
        fetchEmergency(),
      ]);
      if (cancelled) return;
      if (remoteModules?.length) {
        setModules(remoteModules);
        writeJson(MODULES_KEY, remoteModules);
        setDbSynced(true);
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
    const sync = () => {
      setModules(readJson(MODULES_KEY, DEFAULT_MODULES));
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
    window.addEventListener("ab:mc-store", sync);
    return () => window.removeEventListener("ab:mc-store", sync);
  }, []);

  const toggleModule = useCallback(
    (key: PlatformModuleKey) => {
      setModules((prev) => {
        const target = prev.find((m) => m.key === key);
        const enabled = target ? !target.enabled : true;
        const next = prev.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m));
        writeJson(MODULES_KEY, next);
        void toggleModuleDb(key, enabled);
        return next;
      });
    },
    [],
  );

  const patchEmergency = useCallback((patch: Partial<EmergencyFlags>) => {
    setEmergency((prev) => {
      const next = { ...prev, ...patch };
      writeJson(EMERGENCY_KEY, next);
      void patchEmergencyDb(patch);
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

  return { modules, auditLog, emergency, toggleModule, patchEmergency, addAudit, dbSynced };
}
