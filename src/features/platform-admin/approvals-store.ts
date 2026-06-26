import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApprovalItem, ApprovalStatus } from "./types";
import { enrichApprovalItem, normalizeApprovalStatus, canTakeApprovalDecision } from "./types";
import { isOwnerSessionActive } from "./owner-access-store";
import {
  fetchApprovalById,
  fetchApprovals,
  getCurrentPlatformAdmin,
  insertApprovalNotificationDb,
  insertAuditDb,
  patchApprovalDb,
  syncApprovalSourceStatus,
} from "./platform-api";

const LEGACY_STORAGE_KEY = "ab:approvals-center";
const SYNC_EVENT = "ab:approvals-sync";

type NotifyKind = "approved" | "rejected" | "needs_info" | "under_review";

type StoreSnapshot = {
  items: ApprovalItem[];
  loading: boolean;
  loadError: string | null;
};

let snapshot: StoreSnapshot = { items: [], loading: true, loadError: null };
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  }
  listeners.forEach((l) => l());
}

function setSnapshot(next: Partial<StoreSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

function isToday(ts?: number): boolean {
  if (!ts) return false;
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

async function loadFromDb() {
  setSnapshot({ loading: true });
  const remote = await fetchApprovals();
  if (remote) {
    setSnapshot({ items: remote.map(enrichApprovalItem), loadError: null, loading: false });
  } else {
    setSnapshot({ items: [], loadError: "تعذر تحميل الطلبات من قاعدة البيانات", loading: false });
  }
}

let bootstrapped = false;
function ensureBootstrapped() {
  if (bootstrapped) return;
  bootstrapped = true;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  void loadFromDb();
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "الآن";
  if (diff < 3600_000) return `منذ ${Math.floor(diff / 60_000)} د`;
  if (diff < 86400_000) return `منذ ${Math.floor(diff / 3600_000)} س`;
  return new Date(ts).toLocaleDateString("ar-EG", { dateStyle: "medium" });
}

async function notifyRequester(item: ApprovalItem, kind: NotifyKind, body: string, titleOverride?: string) {
  const recipientId = item.submittedBy ?? item.churchId ?? item.id;
  const title =
    titleOverride ??
    (kind === "approved"
      ? "تم اعتماد طلبك"
      : kind === "rejected"
        ? "تم رفض طلبك"
        : kind === "needs_info"
          ? "مطلوب معلومات إضافية"
          : "طلبك قيد المراجعة");
  await insertApprovalNotificationDb(item.id, recipientId, title, body, kind);
}

async function applyPatch(
  id: string,
  next: Partial<ApprovalItem>,
  auditAction: string,
  auditReason: string,
  notify?: { kind: NotifyKind; body: string; title?: string },
): Promise<boolean> {
  if (!isOwnerSessionActive()) return false;

  const item = snapshot.items.find((i) => i.id === id) ?? (await fetchApprovalById(id));
  if (!item) return false;

  const merged: ApprovalItem = enrichApprovalItem({ ...item, ...next });
  const linked = (await fetchApprovalById(id)) ?? item;

  const syncOk = await syncApprovalSourceStatus(
    linked.sourceTable,
    linked.sourceId,
    merged.status,
    id,
    linked.kind,
  );
  if (!syncOk) return false;

  const ok = await patchApprovalDb(id, {
    status: merged.status,
    reviewedBy: merged.reviewedBy,
    reviewedAt: merged.reviewedAt ? new Date(merged.reviewedAt).toISOString() : undefined,
    rejectionReason: merged.rejectionReason ?? null,
    adminNotes: merged.adminNotes ?? merged.reviewNotes ?? null,
  });
  if (!ok) return false;

  await insertAuditDb(auditAction, auditReason);
  if (notify) await notifyRequester(merged, notify.kind, notify.body, notify.title);

  const refreshed = await fetchApprovalById(id);
  if (refreshed) {
    const enriched = enrichApprovalItem(refreshed);
    setSnapshot({
      items: snapshot.items.some((i) => i.id === id)
        ? snapshot.items.map((i) => (i.id === id ? enriched : i))
        : [enriched, ...snapshot.items],
    });
  } else {
    await loadFromDb();
  }
  return true;
}

export function useApprovalsCenter() {
  const [, tick] = useState(0);

  useEffect(() => {
    ensureBootstrapped();
    const sync = () => tick((n) => n + 1);
    listeners.add(sync);
    window.addEventListener(SYNC_EVENT, sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener(SYNC_EVENT, sync);
    };
  }, []);

  const { items, loading, loadError } = snapshot;

  const reload = useCallback(async () => {
    await loadFromDb();
  }, []);

  const getById = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  const refreshOne = useCallback(async (id: string): Promise<ApprovalItem | null> => {
    const remote = await fetchApprovalById(id);
    if (!remote) return null;
    const enriched = enrichApprovalItem(remote);
    setSnapshot({
      items: snapshot.items.some((i) => i.id === enriched.id)
        ? snapshot.items.map((i) => (i.id === enriched.id ? enriched : i))
        : [enriched, ...snapshot.items],
    });
    return enriched;
  }, []);

  const pendingCount = useMemo(
    () => items.filter((i) => normalizeApprovalStatus(i.status) === "pending").length,
    [items],
  );

  const dashboardCounts = useMemo(
    () => ({
      pending: items.filter((i) => normalizeApprovalStatus(i.status) === "pending").length,
      underReview: items.filter((i) => normalizeApprovalStatus(i.status) === "under_review").length,
      approvedToday: items.filter((i) => i.status === "approved" && isToday(i.reviewedAt)).length,
      rejectedToday: items.filter((i) => i.status === "rejected" && isToday(i.reviewedAt)).length,
    }),
    [items],
  );

  const summary = useMemo(
    () => ({
      churches: items.filter(
        (i) =>
          (i.kind === "church_setup" || i.kind === "church_claim") &&
          normalizeApprovalStatus(i.status) === "pending",
      ).length,
      priests: items.filter((i) => i.kind === "priest_verification" && normalizeApprovalStatus(i.status) === "pending").length,
      servants: items.filter((i) => i.kind === "servant_verification" && normalizeApprovalStatus(i.status) === "pending").length,
      saints: items.filter((i) => i.kind === "saint_image" && normalizeApprovalStatus(i.status) === "pending").length,
      reports: items.filter((i) => i.kind === "critical_report" && normalizeApprovalStatus(i.status) === "pending").length,
      verification: items.filter(
        (i) =>
          (i.kind === "church_verification" ||
            i.kind === "priest_account_verification" ||
            i.kind === "official_account_verification") &&
          normalizeApprovalStatus(i.status) === "pending",
      ).length,
    }),
    [items],
  );

  const startReview = useCallback(async (id: string) => {
    if (!isOwnerSessionActive()) return false;
    const item = snapshot.items.find((i) => i.id === id) ?? (await fetchApprovalById(id));
    if (!item) return false;
    if (normalizeApprovalStatus(item.status) !== "pending") return true;

    const reviewer = await getCurrentPlatformAdmin();
    return applyPatch(
      id,
      { status: "under_review", reviewedBy: reviewer },
      `مراجعة — ${item.title}`,
      "Status → under_review",
      { kind: "under_review", body: `طلب ${item.requestNo} قيد المراجعة.` },
    );
  }, []);

  const approveRequest = useCallback(async (id: string) => {
    const item = snapshot.items.find((i) => i.id === id) ?? (await fetchApprovalById(id));
    if (!item || !canTakeApprovalDecision(item.status)) return false;
    const reviewer = await getCurrentPlatformAdmin();
    const now = Date.now();
    const notifyBody =
      item.kind === "saint_image"
        ? "تمت إضافة الصورة إلى مكتبة Alpha الرسمية. سيتم حفظ مساهمتك بشكل دائم."
        : `تم اعتماد طلب ${item.requestNo} بنجاح.`;
    const notifyTitle = item.kind === "saint_image" ? "🎉 تم اعتماد صورتك" : undefined;
    return applyPatch(
      id,
      { status: "approved", reviewedBy: reviewer, reviewedAt: now, rejectionReason: undefined, adminNotes: undefined },
      `اعتماد — ${item.title}`,
      `Approved by ${reviewer} at ${new Date(now).toLocaleString("ar-EG")}`,
      { kind: "approved", body: notifyBody, title: notifyTitle },
    );
  }, []);

  const rejectRequest = useCallback(async (id: string, reason: string) => {
    const item = snapshot.items.find((i) => i.id === id) ?? (await fetchApprovalById(id));
    if (!item || !reason.trim() || !canTakeApprovalDecision(item.status)) return false;
    const reviewer = await getCurrentPlatformAdmin();
    const now = Date.now();
    return applyPatch(
      id,
      { status: "rejected", reviewedBy: reviewer, reviewedAt: now, rejectionReason: reason.trim() },
      `رفض — ${item.title}`,
      reason.trim(),
      { kind: "rejected", body: `تم رفض طلب ${item.requestNo}. السبب: ${reason.trim()}` },
    );
  }, []);

  const requestInfo = useCallback(async (id: string, notes: string) => {
    const item = snapshot.items.find((i) => i.id === id) ?? (await fetchApprovalById(id));
    if (!item || !notes.trim() || !canTakeApprovalDecision(item.status)) return false;
    const reviewer = await getCurrentPlatformAdmin();
    const now = Date.now();
    return applyPatch(
      id,
      {
        status: "needs_info" as ApprovalStatus,
        reviewedBy: reviewer,
        reviewedAt: now,
        adminNotes: notes.trim(),
        reviewNotes: notes.trim(),
      },
      `طلب معلومات — ${item.title}`,
      notes.trim(),
      { kind: "needs_info", body: `طلب ${item.requestNo} يحتاج معلومات إضافية: ${notes.trim()}` },
    );
  }, []);

  const requestChanges = requestInfo;

  return {
    items,
    loading,
    loadError,
    pendingCount,
    dashboardCounts,
    summary,
    dbSynced: !loadError,
    reload,
    getById,
    refreshOne,
    startReview,
    approveRequest,
    rejectRequest,
    requestInfo,
    requestChanges,
  };
}
