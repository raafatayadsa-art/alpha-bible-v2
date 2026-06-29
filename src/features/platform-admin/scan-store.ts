import { useCallback, useEffect, useState } from "react";
import {
  fetchScanHistoryDb,
  insertScanHistoryDb,
  resolveTrustProfileDb,
  saveTrustProfileDb,
} from "./platform-api";

export type QrScanType = "user" | "church" | "priest" | "servant";
export type AccountType = "member" | "servant" | "priest";
export type AccountStatus = "active" | "restricted" | "blocked" | "review";
export type TrustStatus = "good" | "watch" | "restricted" | "blocked";
export type ChurchStatus = "active" | "suspended" | "disabled";
export type VerificationStatus = "verified" | "pending" | "rejected";

export type AdminActionRecord = {
  id: string;
  action: string;
  date: string;
  by: string;
};

export type ChurchTransferRecord = {
  from: string;
  to: string;
  date: string;
};

export type PersonTrustProfile = {
  kind: "person";
  id: string;
  qrType: Exclude<QrScanType, "church">;
  displayName: string;
  membershipId: string;
  accountType: AccountType;
  accountStatus: AccountStatus;
  currentChurch: string;
  appJoinDate: string;
  churchJoinDate: string;
  banCount: number;
  restrictionCount: number;
  confirmedReports: number;
  rejectedReports: number;
  adminActions: AdminActionRecord[];
  churchTransfers: ChurchTransferRecord[];
  platformPermissions: string[];
  lastPublicActivity: string;
  trustStatus: TrustStatus;
};

export type ChurchTrustProfile = {
  kind: "church";
  id: string;
  qrType: "church";
  churchName: string;
  churchId: string;
  verificationStatus: VerificationStatus;
  churchStatus: ChurchStatus;
  responsiblePriest: string;
  memberCount: number;
  servantCount: number;
  storageUsed: string;
  openReports: number;
  closedReports: number;
  lastPublicActivity: string;
  trustStatus: TrustStatus;
  platformActions: AdminActionRecord[];
};

export type TrustProfile = PersonTrustProfile | ChurchTrustProfile;

export type ScanHistoryEntry = {
  id: string;
  trustId: string;
  qrType: QrScanType;
  label: string;
  timestamp: number;
  accessReason?: string;
};

export type ScanAuditMeta = {
  scanType: QrScanType;
  trustId: string;
  accessReason?: string;
};

const HISTORY_KEY = "ab:mc-scan-history";
const PROFILES_KEY = "ab:mc-trust-profiles";

const DEFAULT_PROFILES: Record<string, TrustProfile> = {};

const QR_ALIASES: Record<string, string> = {};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ab:scan-store"));
  } catch { /* ignore */ }
}

function mergeProfiles(): Record<string, TrustProfile> {
  const overrides = readJson<Record<string, TrustProfile>>(PROFILES_KEY, {});
  return { ...DEFAULT_PROFILES, ...overrides };
}

export function normalizeQrCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function resolveQrCodeAsync(raw: string): Promise<TrustProfile | null> {
  const remote = await resolveTrustProfileDb(raw);
  if (remote) return remote;
  return resolveQrCode(raw);
}

export async function getTrustProfileAsync(trustId: string): Promise<TrustProfile | null> {
  const remote = await resolveTrustProfileDb(trustId);
  if (remote) return remote;
  return getTrustProfile(trustId);
}

export function resolveQrCode(raw: string): TrustProfile | null {
  const code = normalizeQrCode(raw);
  const trustId = QR_ALIASES[code] ?? QR_ALIASES[code.toLowerCase()] ?? code.toLowerCase();
  return mergeProfiles()[trustId] ?? null;
}

export function getTrustProfile(trustId: string): TrustProfile | null {
  return mergeProfiles()[trustId] ?? null;
}

function profileLabel(p: TrustProfile): string {
  return p.kind === "person" ? p.displayName : p.churchName;
}

export function recordScan(profile: TrustProfile, accessReason?: string): ScanHistoryEntry {
  const entry: ScanHistoryEntry = {
    id: String(Date.now()),
    trustId: profile.id,
    qrType: profile.qrType,
    label: profileLabel(profile),
    timestamp: Date.now(),
    accessReason: accessReason?.trim() || undefined,
  };
  const prev = readJson<ScanHistoryEntry[]>(HISTORY_KEY, []);
  const next = [entry, ...prev.filter((e) => e.trustId !== profile.id)].slice(0, 12);
  writeJson(HISTORY_KEY, next);
  void insertScanHistoryDb(profile.id, profile.qrType, profileLabel(profile), accessReason);
  return entry;
}

export function getRecentScans(): ScanHistoryEntry[] {
  return readJson<ScanHistoryEntry[]>(HISTORY_KEY, []);
}

function saveProfile(profile: TrustProfile) {
  const overrides = readJson<Record<string, TrustProfile>>(PROFILES_KEY, {});
  overrides[profile.id] = profile;
  writeJson(PROFILES_KEY, overrides);
  void saveTrustProfileDb(profile.id, profile);
}

export function applyPersonAction(
  profileId: string,
  action: "restrict" | "unrestrict" | "block" | "unblock" | "note",
  note?: string,
): TrustProfile | null {
  const profile = getTrustProfile(profileId);
  if (!profile || profile.kind !== "person") return null;

  const today = new Date().toISOString().slice(0, 10);
  const next = { ...profile, adminActions: [...profile.adminActions] };

  switch (action) {
    case "restrict":
      next.accountStatus = "restricted";
      next.restrictionCount += 1;
      next.trustStatus = "restricted";
      next.adminActions.unshift({ id: String(Date.now()), action: "تقييد الحساب", date: today, by: "Owner" });
      break;
    case "unrestrict":
      next.accountStatus = "active";
      next.trustStatus = "good";
      next.adminActions.unshift({ id: String(Date.now()), action: "فك التقييد", date: today, by: "Owner" });
      break;
    case "block":
      next.accountStatus = "blocked";
      next.banCount += 1;
      next.trustStatus = "blocked";
      next.adminActions.unshift({ id: String(Date.now()), action: "حظر الحساب", date: today, by: "Owner" });
      break;
    case "unblock":
      next.accountStatus = "active";
      next.trustStatus = "watch";
      next.adminActions.unshift({ id: String(Date.now()), action: "فك الحظر", date: today, by: "Owner" });
      break;
    case "note":
      next.adminActions.unshift({
        id: String(Date.now()),
        action: note?.trim() ? `ملاحظة: ${note.trim()}` : "ملاحظة إدارية",
        date: today,
        by: "Owner",
      });
      break;
  }

  saveProfile(next);
  return next;
}

export function applyChurchAction(
  profileId: string,
  action: "review" | "suspend" | "reactivate" | "note",
  note?: string,
): TrustProfile | null {
  const profile = getTrustProfile(profileId);
  if (!profile || profile.kind !== "church") return null;

  const today = new Date().toISOString().slice(0, 10);
  const next = { ...profile, platformActions: [...profile.platformActions] };

  switch (action) {
    case "review":
      next.platformActions.unshift({ id: String(Date.now()), action: "مراجعة حالة الكنيسة", date: today, by: "Owner" });
      break;
    case "suspend":
      next.churchStatus = "suspended";
      next.trustStatus = "restricted";
      next.platformActions.unshift({ id: String(Date.now()), action: "تعليق الكنيسة", date: today, by: "Owner" });
      break;
    case "reactivate":
      next.churchStatus = "active";
      next.trustStatus = "good";
      next.platformActions.unshift({ id: String(Date.now()), action: "إعادة تفعيل الكنيسة", date: today, by: "Owner" });
      break;
    case "note":
      next.platformActions.unshift({
        id: String(Date.now()),
        action: note?.trim() ? `ملاحظة: ${note.trim()}` : "ملاحظة إدارية",
        date: today,
        by: "Owner",
      });
      break;
  }

  saveProfile(next);
  return next;
}

export function logScanAccess(
  profile: TrustProfile,
  addAudit: (action: string, reason: string, scanMeta?: ScanAuditMeta) => void,
  accessReason?: string,
) {
  recordScan(profile, accessReason);
  addAudit(
    `Scan Center — ${profile.qrType.toUpperCase()} QR`,
    `${profileLabel(profile)} · Platform Trust Profile`,
    { scanType: profile.qrType, trustId: profile.id, accessReason },
  );
}

export function useScanStore() {
  const [recent, setRecent] = useState<ScanHistoryEntry[]>(() => getRecentScans());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchScanHistoryDb();
      if (cancelled || !remote?.length) return;
      const mapped: ScanHistoryEntry[] = remote.map((r) => ({
        id: r.id,
        trustId: r.trustId,
        qrType: r.qrType as QrScanType,
        label: r.label,
        timestamp: r.timestamp,
        accessReason: r.accessReason,
      }));
      writeJson(HISTORY_KEY, mapped);
      setRecent(mapped);
    })();
    const sync = () => setRecent(getRecentScans());
    window.addEventListener("ab:scan-store", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("ab:scan-store", sync);
    };
  }, []);

  const refresh = useCallback(() => setRecent(getRecentScans()), []);

  return { recent, refresh };
}

export const TRUST_STATUS_LABEL: Record<TrustStatus, string> = {
  good: "Good",
  watch: "Watch",
  restricted: "Restricted",
  blocked: "Blocked",
};

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  active: "نشط",
  restricted: "مقيد",
  blocked: "محظور",
  review: "تحت المراجعة",
};

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  member: "عضو",
  servant: "خادم",
  priest: "كاهن",
};

export const CHURCH_STATUS_LABEL: Record<ChurchStatus, string> = {
  active: "نشطة",
  suspended: "معلقة",
  disabled: "موقوفة",
};

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "موثّقة",
  pending: "قيد المراجعة",
  rejected: "مرفوضة",
};
