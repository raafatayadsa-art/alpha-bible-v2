import { supabase } from "@/integrations/supabase/client";
import { ensureAudioPublisherPublished } from "@/features/publisher/publisher-discovery-api";
import { fetchAuthUser, getAuthUserSync } from "@/features/auth";
import type { ApprovalItem, ApprovalKind, ApprovalPriority, ApprovalStatus } from "./types";
import type { AuditLogEntry, EmergencyFlags, ModuleState, PlatformModuleKey } from "./platform-store";
import { mergeOwnerModuleStates } from "@/lib/platform-modules";
import type { ScanAuditMeta, TrustProfile } from "./scan-store";

let dbReadyCache: boolean | null = null;

/** Current reviewer label for audit + approval patches (auth user). */
export async function getCurrentPlatformAdmin(): Promise<string> {
  const cached = getAuthUserSync();
  if (cached?.email) return cached.email;
  if (cached?.displayName) return cached.displayName;
  try {
    const user = await fetchAuthUser();
    if (user?.email) return user.email;
    if (user?.displayName) return user.displayName;
    if (user?.id) return `user:${user.id.slice(0, 8)}`;
  } catch {
    /* ignore */
  }
  return "system";
}

export type PlatformHealth = {
  database: "operational" | "degraded" | "down";
  supabase: "operational" | "degraded" | "down";
  auth: "operational" | "degraded" | "down";
  storage: "operational" | "degraded" | "down";
  score: number;
};

export type DashboardStats = {
  users: number;
  churches: number;
  priests: number;
  servants: number;
  messages: number;
  requests: number;
  reports: number;
};

export type PrivacyMetrics = {
  blockedWords: number;
  securityReports: number;
  restrictedUsers: number;
  blockedAccounts: number;
  violations: number;
};

export type PlatformReport = {
  id: string;
  kind: "post" | "image" | "comment";
  status: string;
  summary: string;
  severity: string;
  createdAt: number;
};

export type AiRule = {
  key: string;
  label: string;
  labelAr: string;
  enabled: boolean;
  queueCount: number;
};

export type LibraryDoc = {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string | null;
  updatedAt: number;
};

export type PlatformSettings = {
  registrationEnabled: boolean;
  verificationRequired: boolean;
  maintenanceMessage: string;
  allowNewChurches: boolean;
};

type ApprovalRow = {
  id: string;
  request_no: string;
  kind: ApprovalKind;
  type?: string | null;
  source_table?: string | null;
  source_id?: string | null;
  title: string;
  kind_label: string;
  submitted_at: string;
  created_at?: string | null;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  submitted_by?: string | null;
  church_id?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  review_notes?: string | null;
  admin_notes?: string | null;
  documents?: unknown;
  payload: Record<string, unknown>;
};

type ChurchSetupRequestRow = {
  id: string;
  church_name: string;
  diocese?: string | null;
  governorate?: string | null;
  city?: string | null;
  address?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  priest_name?: string | null;
  priest_phone?: string | null;
  priest_email?: string | null;
  status: string;
  documents?: unknown;
  payload?: Record<string, unknown>;
  notes?: string | null;
  created_at: string;
};

function payloadString(p: Record<string, unknown>, key: string): string | undefined {
  const v = p[key];
  return typeof v === "string" ? v : undefined;
}

function payloadStringArray(p: Record<string, unknown>, key: string): string[] | undefined {
  const v = p[key];
  if (!Array.isArray(v)) return undefined;
  return v.filter((x): x is string => typeof x === "string");
}

function rowToApproval(row: ApprovalRow): ApprovalItem {
  const p = row.payload ?? {};
  const kind = (row.type ?? row.kind) as ApprovalKind;
  const documentFiles = parseDocumentFiles(row.documents) ?? parseDocumentFiles(p.documentFiles);
  const adminNotes = row.admin_notes ?? row.review_notes ?? undefined;
  return {
    id: row.id,
    requestNo: row.request_no,
    kind,
    title: row.title,
    kindLabel: row.kind_label,
    submittedAt: new Date(row.submitted_at ?? row.created_at ?? Date.now()).getTime(),
    status: row.status,
    priority: row.priority,
    submittedBy: row.submitted_by ?? payloadString(p, "submittedBy"),
    churchId: row.church_id ?? payloadString(p, "churchId"),
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).getTime() : undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    adminNotes,
    reviewNotes: adminNotes,
    sourceTable: row.source_table ?? undefined,
    sourceId: row.source_id ?? undefined,
    churchName: payloadString(p, "churchName"),
    diocese: payloadString(p, "diocese"),
    city: payloadString(p, "city") ?? payloadString(p, "address"),
    applicantNotes: payloadString(p, "applicantNotes") ?? payloadString(p, "notes"),
    priestName: payloadString(p, "priestName"),
    verificationStatus: payloadString(p, "verificationStatus"),
    address: payloadString(p, "address"),
    responsiblePriest: payloadString(p, "responsiblePriest"),
    photos: payloadStringArray(p, "photos"),
    verificationData: payloadString(p, "verificationData"),
    churchLabel: payloadString(p, "churchLabel"),
    documentsStatus: payloadString(p, "documentsStatus"),
    phone: payloadString(p, "phone") ?? payloadString(p, "churchPhone"),
    idImageUrl: payloadString(p, "idImageUrl"),
    documents: payloadStringArray(p, "documents"),
    systemNotes: payloadString(p, "systemNotes"),
    saintName: payloadString(p, "saintName"),
    contributorName: payloadString(p, "contributorName"),
    thumbnailUrl: payloadString(p, "thumbnailUrl"),
    aiScanResults: payloadString(p, "aiScanResults"),
    relatedReports: payloadString(p, "relatedReports"),
    reportType: payloadString(p, "reportType"),
    severity: payloadString(p, "severity"),
    verificationTarget: payloadString(p, "verificationTarget"),
    submitterAvatarUrl: payloadString(p, "submitterAvatarUrl"),
    riskScore: typeof p.riskScore === "number" ? p.riskScore : payloadString(p, "riskScore") ? Number(payloadString(p, "riskScore")) : undefined,
    email: payloadString(p, "email"),
    dateOfBirth: payloadString(p, "dateOfBirth"),
    maritalStatus: payloadString(p, "maritalStatus"),
    roleTitle: payloadString(p, "roleTitle"),
    yearsOfService: payloadString(p, "yearsOfService"),
    rank: payloadString(p, "rank"),
    documentFiles,
    verificationChecks: parseVerificationChecks(p.verificationChecks),
    aiReview: parseAiReview(p.aiReview),
    payload: p,
  };
}

function mergeChurchSetupRequest(item: ApprovalItem, setup: ChurchSetupRequestRow): ApprovalItem {
  const sp = setup.payload ?? {};
  const docs = parseDocumentFiles(setup.documents) ?? item.documentFiles;
  return {
    ...item,
    kind: "church_setup",
    churchName: setup.church_name,
    diocese: setup.diocese ?? item.diocese,
    city: setup.city ?? item.city,
    address: setup.address ?? item.address,
    priestName: setup.priest_name ?? item.priestName,
    responsiblePriest: setup.priest_name ?? item.responsiblePriest,
    phone: setup.priest_phone ?? payloadString(sp, "churchPhone") ?? item.phone,
    email: setup.priest_email ?? item.email,
    applicantNotes: setup.notes ?? item.applicantNotes,
    verificationStatus: setup.status === "pending" ? "قيد المراجعة" : setup.status,
    documentFiles: docs,
    photos:
      setup.location_lat != null && setup.location_lng != null
        ? [`https://static-maps.yandex.ru/1.x/?ll=${setup.location_lng},${setup.location_lat}&size=400,300&z=14&l=map`]
        : item.photos,
    rank: payloadString(sp, "priestRank") ?? item.rank,
    roleTitle: payloadString(sp, "priestRank") ?? item.roleTitle,
    sourceTable: "church_setup_requests",
    sourceId: setup.id,
    payload: { ...(item.payload ?? {}), ...sp },
  };
}

async function fetchChurchSetupRequestById(id: string): Promise<ChurchSetupRequestRow | null> {
  const { data, error } = await supabase.from("church_setup_requests").select("*").eq("id", id).maybeSingle();
  if (error || !data) {
    if (error) console.error("supabase error", error);
    return null;
  }
  return data as ChurchSetupRequestRow;
}

function parseDocumentFiles(raw: unknown): ApprovalItem["documentFiles"] {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((x, i) => ({
      id: String(x.id ?? `doc-${i}`),
      label: String(x.label ?? "مستند"),
      url: String(x.url ?? "/placeholder.svg"),
      verified: Boolean(x.verified ?? true),
    }));
}

function parseVerificationChecks(raw: unknown): ApprovalItem["verificationChecks"] {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((x) => ({ label: String(x.label ?? ""), passed: Boolean(x.passed) }));
}

function parseAiReview(raw: unknown): ApprovalItem["aiReview"] {
  if (typeof raw !== "object" || raw === null) return undefined;
  const x = raw as Record<string, unknown>;
  const level = x.riskLevel;
  return {
    confidence: Number(x.confidence ?? 0),
    matchScore: Number(x.matchScore ?? 0),
    riskScore: Number(x.riskScore ?? 0),
    riskLevel: level === "high" || level === "medium" || level === "low" ? level : "low",
    notes: String(x.notes ?? ""),
  };
}

type AuditRow = {
  id: string;
  action: string;
  admin: string;
  reason: string;
  scan_meta: ScanAuditMeta | null;
  created_at: string;
};

export async function checkPlatformDbReady(): Promise<boolean> {
  if (dbReadyCache === true) return true;
  const { error } = await supabase.from("platform_modules").select("key").limit(1);
  dbReadyCache = !error;
  return !error;
}

export async function fetchPlatformHealth(): Promise<PlatformHealth> {
  const health: PlatformHealth = {
    database: "down",
    supabase: "down",
    auth: "operational",
    storage: "operational",
    score: 0,
  };

  const dbOk = await checkPlatformDbReady();
  health.database = dbOk ? "operational" : "down";
  health.supabase = dbOk ? "operational" : "down";

  try {
    const { error } = await supabase.auth.getSession();
    health.auth = error ? "degraded" : "operational";
  } catch {
    health.auth = "degraded";
  }

  try {
    const { error } = await supabase.storage.listBuckets();
    health.storage = error ? "degraded" : "operational";
  } catch {
    health.storage = "degraded";
  }

  const parts = [health.database, health.supabase, health.auth, health.storage];
  const operational = parts.filter((p) => p === "operational").length;
  health.score = Math.round((operational / parts.length) * 100);
  return health;
}

export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  const { data: live, error: liveErr } = await supabase.rpc("platform_live_dashboard_stats");
  if (!liveErr && live && typeof live === "object") {
    const row = live as Record<string, number>;
    return {
      users: row.users ?? 0,
      churches: row.churches ?? 0,
      priests: row.priests ?? 0,
      servants: row.servants ?? 0,
      messages: row.messages ?? 0,
      requests: row.requests ?? 0,
      reports: row.reports ?? 0,
    };
  }

  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_dashboard_stats").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return {
    users: data.user_count,
    churches: data.church_count,
    priests: data.priest_count,
    servants: data.servant_count,
    messages: data.message_count,
    requests: data.request_count,
    reports: data.report_count,
  };
}

export async function fetchApprovals(): Promise<ApprovalItem[] | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase
    .from("platform_approvals")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error || !data) return null;
  return (data as ApprovalRow[]).map(rowToApproval);
}

export async function fetchApprovalById(id: string): Promise<ApprovalItem | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_approvals").select("*").eq("id", id).maybeSingle();
  if (error || !data) {
    if (error) console.error("supabase error", error);
    return null;
  }
  let item = rowToApproval(data as ApprovalRow);
  const row = data as ApprovalRow;
  if (row.source_table === "church_setup_requests" && row.source_id) {
    const setup = await fetchChurchSetupRequestById(row.source_id);
    if (setup) item = mergeChurchSetupRequest(item, setup);
  }
  return item;
}

async function syncChurchClaimApproval(
  status: ApprovalStatus,
  approvalId?: string,
  claimId?: string | null,
): Promise<void> {
  let payload: Record<string, unknown> = {};
  let resolvedClaimId = claimId ?? undefined;

  if (approvalId) {
    const { data: approval, error } = await supabase
      .from("platform_approvals")
      .select("payload, kind, type")
      .eq("id", approvalId)
      .maybeSingle();
    if (error) {
      console.error("supabase error", error);
      return;
    }
    if (approval) {
      payload = (approval.payload ?? {}) as Record<string, unknown>;
      const kind = approval.kind ?? approval.type;
      if (kind !== "church_claim") return;
    }
  }

  if (!resolvedClaimId && typeof payload.claimId === "string") {
    resolvedClaimId = payload.claimId;
  }

  const churchIdRaw = payload.churchId;
  const churchId =
    typeof churchIdRaw === "number"
      ? churchIdRaw
      : typeof churchIdRaw === "string" && churchIdRaw.trim()
        ? Number(churchIdRaw)
        : null;

  const claimStatus =
    status === "approved"
      ? "approved"
      : status === "rejected"
        ? "rejected"
        : status === "needs_info" || status === "needs_changes"
          ? "pending"
          : "pending";

  if (resolvedClaimId) {
    const { error: claimError } = await supabase
      .from("church_claim_requests")
      .update({ status: claimStatus, updated_at: new Date().toISOString() })
      .eq("id", resolvedClaimId);
    if (claimError) console.error("supabase error", claimError);
  }

  if (!churchId || Number.isNaN(churchId)) return;

  if (status === "approved") {
    const { error: churchError } = await supabase
      .from("churches")
      .update({
        page_status: "verified",
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", churchId);
    if (churchError) console.error("supabase error", churchError);

    const ownerRaw = payload.submittedBy;
    const ownerId = typeof ownerRaw === "string" && ownerRaw.trim() ? ownerRaw : null;
    const { error: pubError } = await supabase.rpc("ensure_church_publisher", {
      p_church_id: churchId,
      p_owner_id: ownerId,
    });
    if (pubError) console.error("supabase error", pubError);
    return;
  }

  if (status === "rejected") {
    const { error: churchError } = await supabase
      .from("churches")
      .update({
        page_status: "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("id", churchId);
    if (churchError) console.error("supabase error", churchError);
  }
}

async function loadApprovalPayload(approvalId?: string): Promise<Record<string, unknown>> {
  if (!approvalId) return {};
  const { data: approval, error } = await supabase
    .from("platform_approvals")
    .select("payload, kind, type, source_id, source_table")
    .eq("id", approvalId)
    .maybeSingle();
  if (error || !approval) return {};
  const payload = (approval.payload ?? {}) as Record<string, unknown>;
  if (!payload.publisherId && !payload.publisher_id && approval.source_table === "publishers" && approval.source_id) {
    payload.publisherId = approval.source_id;
  }
  return payload;
}

async function runPublisherApprovalSync(approvalId: string, status: ApprovalStatus): Promise<boolean> {
  const { data, error } = await supabase.rpc("apply_publisher_approval_sync", {
    p_approval_id: approvalId,
    p_status: status,
  });

  if (error) {
    console.error("[apply_publisher_approval_sync]", error.message);
    return false;
  }

  const result = data as { ok?: boolean; reason?: string; publisherId?: string } | null;
  if (!result?.ok) {
    console.error("[apply_publisher_approval_sync]", result?.reason ?? "unknown");
    return false;
  }

  if (status === "approved" && result.publisherId) {
    await ensureAudioPublisherPublished(result.publisherId);
  } else if (status === "approved") {
    const payload = await loadApprovalPayload(approvalId);
    const publisherId =
      typeof payload.publisherId === "string"
        ? payload.publisherId
        : typeof payload.publisher_id === "string"
          ? payload.publisher_id
          : null;
    if (publisherId) await ensureAudioPublisherPublished(publisherId);
  }

  return true;
}

async function syncPublisherSetupApproval(status: ApprovalStatus, approvalId?: string): Promise<boolean> {
  if (!approvalId) return false;
  return runPublisherApprovalSync(approvalId, status);
}

async function syncPublisherPublicationApproval(status: ApprovalStatus, approvalId?: string): Promise<boolean> {
  if (!approvalId) return false;
  return runPublisherApprovalSync(approvalId, status);
}

async function syncContentReviewApproval(status: ApprovalStatus, approvalId?: string): Promise<void> {
  const payload = await loadApprovalPayload(approvalId);
  const contentId = typeof payload.contentId === "string" ? payload.contentId : null;
  if (!contentId) return;

  const mapped =
    status === "approved"
      ? "approved"
      : status === "rejected"
        ? "rejected"
        : status === "needs_changes" || status === "needs_info"
          ? "needs_changes"
          : "pending_review";

  const { data: item } = await supabase
    .from("publisher_content_items")
    .select("publisher_id")
    .eq("id", contentId)
    .maybeSingle();

  await supabase
    .from("publisher_content_items")
    .update({
      status: mapped,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", contentId);

  if (mapped === "approved" && item?.publisher_id) {
    await supabase.rpc("refresh_publisher_readiness", { p_id: item.publisher_id });
    await ensureAudioPublisherPublished(item.publisher_id);
  }
}

export async function syncApprovalSourceStatus(
  sourceTable: string | null | undefined,
  sourceId: string | null | undefined,
  status: ApprovalStatus,
  approvalId?: string,
  approvalKind?: string,
): Promise<boolean> {
  if (approvalKind === "church_claim" || sourceTable === "church_claim_requests") {
    await syncChurchClaimApproval(status, approvalId, sourceId);
    return true;
  }

  if (approvalKind === "publisher_setup") {
    return syncPublisherSetupApproval(status, approvalId);
  }

  if (approvalKind === "publisher_publication") {
    return syncPublisherPublicationApproval(status, approvalId);
  }

  if (approvalKind === "content_review") {
    await syncContentReviewApproval(status, approvalId);
    return true;
  }

  let setupRequestId =
    sourceTable === "church_setup_requests" && sourceId ? sourceId : null;

  if (!setupRequestId && approvalId) {
    const { data: approval } = await supabase
      .from("platform_approvals")
      .select("source_table, source_id, kind, type")
      .eq("id", approvalId)
      .maybeSingle();

    if (approval?.source_table === "church_setup_requests" && approval.source_id) {
      setupRequestId = approval.source_id;
    } else if (
      (approval?.kind === "church_setup" || approval?.type === "church_setup") &&
      approval.source_id
    ) {
      setupRequestId = approval.source_id;
    }
  }

  if (
    !setupRequestId &&
    (approvalKind === "church_setup" || sourceTable === "church_setup_requests")
  ) {
    console.warn("syncApprovalSourceStatus: church_setup approval missing source_id", approvalId);
    return;
  }

  let galleryImageId =
    sourceTable === "saint_gallery_images" && sourceId ? sourceId : null;

  if (!galleryImageId && approvalId) {
    const { data: approval } = await supabase
      .from("platform_approvals")
      .select("source_table, source_id, kind, type")
      .eq("id", approvalId)
      .maybeSingle();

    if (approval?.source_table === "saint_gallery_images" && approval.source_id) {
      galleryImageId = approval.source_id;
    } else if (
      (approval?.kind === "saint_image" || approval?.type === "saint_image") &&
      approval.source_id
    ) {
      galleryImageId = approval.source_id;
    }
  }

  if (galleryImageId) {
    const { approveSaintGalleryImage, patchSaintGalleryStatus } = await import(
      "@/features/saint-gallery/gallery-api"
    );
    const reviewer = await getCurrentPlatformAdmin();
    const mappedStatus =
      status === "approved"
        ? "approved"
        : status === "rejected"
          ? "rejected"
          : status === "needs_info" || status === "needs_changes"
            ? "needs_changes"
            : status === "under_review"
              ? "under_review"
              : "pending";

    if (mappedStatus === "approved") {
      await approveSaintGalleryImage(galleryImageId, reviewer);
    } else {
      await patchSaintGalleryStatus(galleryImageId, mappedStatus, reviewer);
    }
    return true;
  }

  if (!setupRequestId) return true;

  const mapped =
    status === "approved"
      ? "approved"
      : status === "rejected"
        ? "rejected"
        : status === "needs_info"
          ? "needs_info"
          : status === "under_review"
            ? "under_review"
            : "pending";
  const { error } = await supabase
    .from("church_setup_requests")
    .update({ status: mapped, updated_at: new Date().toISOString() })
    .eq("id", setupRequestId);
  if (error) console.error("supabase error", error);

  if (status === "approved") {
    const { provisionChurchFromSetupRequest } = await import("@/features/church/church-provisioning");
    const { getAuthUserId } = await import("@/features/auth");
    const fallbackUserId = await getAuthUserId();
    await provisionChurchFromSetupRequest(setupRequestId, fallbackUserId);
  }
  return true;
}

export type ApprovalPatch = {
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  reviewNotes?: string | null;
};

export async function patchApprovalDb(id: string, patch: ApprovalPatch): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;
  const row: Record<string, unknown> = {
    status: patch.status,
    updated_at: new Date().toISOString(),
  };
  if (patch.reviewedBy !== undefined) row.reviewed_by = patch.reviewedBy;
  if (patch.reviewedAt !== undefined) row.reviewed_at = patch.reviewedAt;
  if (patch.rejectionReason !== undefined) row.rejection_reason = patch.rejectionReason;
  const notes = patch.adminNotes ?? patch.reviewNotes;
  if (notes !== undefined) {
    row.review_notes = notes;
    row.admin_notes = notes;
  }
  let { error } = await supabase.from("platform_approvals").update(row).eq("id", id);
  if (error && notes !== undefined && row.admin_notes !== undefined) {
    delete row.admin_notes;
    ({ error } = await supabase.from("platform_approvals").update(row).eq("id", id));
  }
  return !error;
}

export async function insertApprovalNotificationDb(
  approvalId: string,
  recipientId: string,
  title: string,
  body: string,
  kind: "approved" | "rejected" | "needs_info" | "needs_changes" | "under_review",
): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;
  const { error } = await supabase.from("platform_approval_notifications").insert({
    approval_id: approvalId,
    recipient_id: recipientId,
    title,
    body,
    kind,
  });
  return !error;
}

export async function updateApprovalStatusDb(id: string, status: ApprovalStatus): Promise<boolean> {
  return patchApprovalDb(id, { status });
}

export async function approveAllPendingDb(): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;
  const { error } = await supabase
    .from("platform_approvals")
    .update({ status: "approved" })
    .in("status", ["pending", "needs_info", "needs_changes"]);
  return !error;
}

export async function fetchModules(): Promise<ModuleState[] | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_modules").select("*").order("key");
  if (error || !data) return null;
  return mergeOwnerModuleStates(
    data.map((r) => ({
      key: r.key as PlatformModuleKey,
      label: r.label,
      labelAr: r.label_ar,
      enabled: r.enabled === true,
    })),
  );
}

export async function toggleModuleDb(key: PlatformModuleKey, enabled: boolean): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;

  const { data: rpcRows, error: rpcErr } = await supabase.rpc("platform_toggle_module", {
    p_key: key,
    p_enabled: enabled,
  });

  if (!rpcErr && rpcRows != null) {
    const row = (Array.isArray(rpcRows) ? rpcRows[0] : rpcRows) as { enabled?: boolean } | undefined;
    if (row && row.enabled === enabled) return true;
  }

  if (rpcErr) {
    console.warn("[platform-modules] RPC toggle failed", rpcErr.message);
  }

  const { data, error } = await supabase
    .from("platform_modules")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("key", key)
    .select("key, enabled")
    .maybeSingle();

  if (error) {
    console.warn("[platform-modules] direct update failed", error.message);
  }

  return !error && data?.enabled === enabled;
}

export async function fetchEmergency(): Promise<EmergencyFlags | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_emergency").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return {
    maintenance: data.maintenance,
    disableRegistration: data.disable_registration,
    disableMessaging: data.disable_messaging,
    disableCommunity: data.disable_community,
    lockdown: data.lockdown,
  };
}

export async function patchEmergencyDb(patch: Partial<EmergencyFlags>): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.maintenance !== undefined) row.maintenance = patch.maintenance;
  if (patch.disableRegistration !== undefined) row.disable_registration = patch.disableRegistration;
  if (patch.disableMessaging !== undefined) row.disable_messaging = patch.disableMessaging;
  if (patch.disableCommunity !== undefined) row.disable_community = patch.disableCommunity;
  if (patch.lockdown !== undefined) row.lockdown = patch.lockdown;
  const { error } = await supabase.from("platform_emergency").update(row).eq("id", 1);
  return !error;
}

export async function fetchAuditLog(): Promise<AuditLogEntry[] | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase
    .from("platform_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return null;
  return (data as AuditRow[]).map((r) => ({
    id: r.id,
    action: r.action,
    admin: r.admin,
    reason: r.reason,
    timestamp: new Date(r.created_at).getTime(),
    scanMeta: r.scan_meta ?? undefined,
  }));
}

export async function insertAuditDb(action: string, reason: string, scanMeta?: ScanAuditMeta): Promise<AuditLogEntry | null> {
  if (!(await checkPlatformDbReady())) return null;
  const admin = await getCurrentPlatformAdmin();
  const { data, error } = await supabase
    .from("platform_audit_log")
    .insert({ action, admin, reason, scan_meta: scanMeta ?? null })
    .select("*")
    .single();
  if (error || !data) return null;
  const r = data as AuditRow;
  return {
    id: r.id,
    action: r.action,
    admin: r.admin,
    reason: r.reason,
    timestamp: new Date(r.created_at).getTime(),
    scanMeta: r.scan_meta ?? undefined,
  };
}

export async function fetchPrivacyMetrics(): Promise<PrivacyMetrics | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_privacy_metrics").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return {
    blockedWords: data.blocked_words_count,
    securityReports: data.security_reports_count,
    restrictedUsers: data.restricted_users_count,
    blockedAccounts: data.blocked_accounts_count,
    violations: data.violations_count,
  };
}

export async function fetchReports(): Promise<PlatformReport[] | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_reports").select("*").order("created_at", { ascending: false });
  if (error || !data) return null;
  return data.map((r) => ({
    id: r.id,
    kind: r.kind,
    status: r.status,
    summary: r.summary,
    severity: r.severity,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function fetchAiRules(): Promise<AiRule[] | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_ai_rules").select("*").order("key");
  if (error || !data) return null;
  return data.map((r) => ({
    key: r.key,
    label: r.label,
    labelAr: r.label_ar,
    enabled: r.enabled,
    queueCount: r.queue_count,
  }));
}

export async function toggleAiRuleDb(key: string, enabled: boolean): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;
  const { error } = await supabase.from("platform_ai_rules").update({ enabled }).eq("key", key);
  return !error;
}

export async function fetchLibraryDocs(): Promise<LibraryDoc[] | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_library_docs").select("*").order("title");
  if (error || !data) return null;
  return data.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description,
    url: r.url,
    updatedAt: new Date(r.updated_at).getTime(),
  }));
}

export async function fetchPlatformSettings(): Promise<PlatformSettings | null> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase.from("platform_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return {
    registrationEnabled: data.registration_enabled,
    verificationRequired: data.verification_required,
    maintenanceMessage: data.maintenance_message,
    allowNewChurches: data.allow_new_churches,
  };
}

export async function patchPlatformSettingsDb(patch: Partial<PlatformSettings>): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.registrationEnabled !== undefined) row.registration_enabled = patch.registrationEnabled;
  if (patch.verificationRequired !== undefined) row.verification_required = patch.verificationRequired;
  if (patch.maintenanceMessage !== undefined) row.maintenance_message = patch.maintenanceMessage;
  if (patch.allowNewChurches !== undefined) row.allow_new_churches = patch.allowNewChurches;
  const { error } = await supabase.from("platform_settings").update(row).eq("id", 1);
  return !error;
}

export async function resolveTrustProfileDb(code: string): Promise<TrustProfile | null> {
  if (!(await checkPlatformDbReady())) return null;
  const normalized = code.trim().toUpperCase();
  const lower = normalized.toLowerCase();

  const byQr = await supabase.from("platform_trust_profiles").select("profile").eq("qr_code", normalized).maybeSingle();
  if (byQr.data?.profile) return byQr.data.profile as TrustProfile;

  const byId = await supabase.from("platform_trust_profiles").select("profile").eq("trust_id", lower).maybeSingle();
  if (byId.data?.profile) return byId.data.profile as TrustProfile;

  return null;
}

export async function saveTrustProfileDb(trustId: string, profile: TrustProfile): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;
  const { error } = await supabase
    .from("platform_trust_profiles")
    .update({ profile, updated_at: new Date().toISOString() })
    .eq("trust_id", trustId);
  return !error;
}

export async function insertScanHistoryDb(
  trustId: string,
  qrType: string,
  label: string,
  accessReason?: string,
): Promise<boolean> {
  if (!(await checkPlatformDbReady())) return false;
  const { error } = await supabase.from("platform_scan_history").insert({
    trust_id: trustId,
    qr_type: qrType,
    label,
    access_reason: accessReason ?? null,
  });
  return !error;
}

export async function fetchScanHistoryDb(): Promise<
  { id: string; trustId: string; qrType: string; label: string; timestamp: number; accessReason?: string }[] | null
> {
  if (!(await checkPlatformDbReady())) return null;
  const { data, error } = await supabase
    .from("platform_scan_history")
    .select("*")
    .order("scanned_at", { ascending: false })
    .limit(12);
  if (error || !data) return null;
  return data.map((r) => ({
    id: r.id,
    trustId: r.trust_id,
    qrType: r.qr_type,
    label: r.label,
    timestamp: new Date(r.scanned_at).getTime(),
    accessReason: r.access_reason ?? undefined,
  }));
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
