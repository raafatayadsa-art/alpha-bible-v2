import { supabase } from "@/integrations/supabase/client";
import type {
  PublisherContentItem,
  PublisherContentKind,
  PublisherContentVisibility,
  PublisherRecord,
  PublisherType,
} from "./types";
import {
  CONTENT_SELECT,
  mapContentFromRow,
  mapPublisherFromRow,
  PUBLISHER_SELECT,
  type PublisherContentRow,
  type PublisherRow,
} from "./publisher-api-internals";

export async function fetchMyPublishers(): Promise<PublisherRecord[]> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) return [];

  const [ownedRes, teamRes] = await Promise.all([
    supabase
      .from("publishers")
      .select(PUBLISHER_SELECT)
      .eq("owner_user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("publisher_team_members")
      .select(`publisher_id, publishers(${PUBLISHER_SELECT})`)
      .eq("user_id", userId),
  ]);

  if (ownedRes.error) console.warn("[fetchMyPublishers]", ownedRes.error.message);
  if (teamRes.error) console.warn("[fetchMyPublishers team]", teamRes.error.message);

  const byId = new Map<string, PublisherRecord>();

  for (const row of ownedRes.data ?? []) {
    const pub = mapPublisherFromRow(row as PublisherRow);
    byId.set(pub.id, { ...pub, accessRole: "owner" });
  }

  for (const row of teamRes.data ?? []) {
    const nested = (row as { publishers?: PublisherRow | PublisherRow[] | null }).publishers;
    const pubRow = Array.isArray(nested) ? nested[0] : nested;
    if (!pubRow?.id || byId.has(pubRow.id)) continue;
    byId.set(pubRow.id, { ...mapPublisherFromRow(pubRow), accessRole: "assistant" });
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function fetchCanCreatePublisherApplication(): Promise<boolean> {
  const { data, error } = await supabase.rpc("can_create_publisher_application");
  if (error) {
    console.warn("[fetchCanCreatePublisherApplication]", error.message);
    const owned = await fetchMyPublishers();
    return !owned.some((p) => p.accessRole === "owner" && p.publisherType !== "church" && p.publisherType !== "monastery");
  }
  return data === true;
}

function parseRpcPublisherId(data: unknown): string | null {
  if (data == null) return null;
  const payload =
    typeof data === "string"
      ? (() => {
          try {
            return JSON.parse(data) as Record<string, unknown>;
          } catch {
            return null;
          }
        })()
      : (data as Record<string, unknown>);
  if (!payload) return null;
  const id = payload.publisherId ?? payload.publisher_id;
  return typeof id === "string" && id.trim().length > 0 ? id.trim() : null;
}

export async function fetchPublisherById(id: string): Promise<PublisherRecord | null> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) return null;

  const { data, error } = await supabase.from("publishers").select(PUBLISHER_SELECT).eq("id", id).maybeSingle();
  if (error || !data) {
    console.warn("[fetchPublisherById]", error?.message);
    return null;
  }
  return mapPublisherFromRow(data as PublisherRow);
}

export async function fetchPublishedPublisher(id: string): Promise<PublisherRecord | null> {
  const { data, error } = await supabase
    .from("publishers")
    .select(PUBLISHER_SELECT)
    .eq("id", id)
    .eq("status", "published")
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) return null;
  return mapPublisherFromRow(data as PublisherRow);
}

export async function fetchPublishedPublisherByChurchId(churchId: string): Promise<PublisherRecord | null> {
  const numericId = Number(churchId);
  if (Number.isNaN(numericId)) return null;

  const { data, error } = await supabase
    .from("publishers")
    .select(PUBLISHER_SELECT)
    .eq("church_id", numericId)
    .eq("status", "published")
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) return null;
  return mapPublisherFromRow(data as PublisherRow);
}

export type SubmitPublisherApplicationInput = {
  publisherType: PublisherType;
  name: string;
  bio?: string;
  logoUrl?: string;
  coverUrl?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  legalConsent?: boolean;
};

export type SubmitPublisherApplicationResult =
  | { ok: true; publisherId: string }
  | { ok: false; reason: string; message: string };

export async function submitPublisherApplication(
  input: SubmitPublisherApplicationInput,
): Promise<SubmitPublisherApplicationResult> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) {
    return { ok: false, reason: "not_authenticated", message: "سجّل دخولك أولاً." };
  }

  const { data, error } = await supabase.rpc("submit_publisher_application", {
    p_type: input.publisherType,
    p_name: input.name.trim(),
    p_bio: input.bio?.trim() || null,
    p_logo_url: input.logoUrl?.trim() || null,
    p_cover_url: input.coverUrl?.trim() || null,
    p_phone: input.phone?.trim() || null,
    p_email: input.email?.trim() || null,
    p_website_url: input.websiteUrl?.trim() || null,
    p_legal_consent: input.legalConsent === true,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("legal_consent_required")) {
      return { ok: false, reason: "legal_consent", message: "يجب الموافقة على الشروط القانونية." };
    }
    if (msg.includes("use_claim_flow")) {
      return {
        ok: false,
        reason: "use_claim_flow",
        message: "الكنائس والأديرة تُستلم من الدليل — لا تُنشأ كصفحة ناشر جديدة.",
      };
    }
    if (msg.includes("not_authenticated")) {
      return { ok: false, reason: "not_authenticated", message: "سجّل دخولك أولاً." };
    }
    if (msg.includes("already_has_publisher")) {
      return {
        ok: false,
        reason: "already_has_publisher",
        message: "لديك صفحة ناشر بالفعل — صفحة واحدة لكل مستخدم.",
      };
    }
    console.error("[submitPublisherApplication]", error);
    return { ok: false, reason: "error", message: "تعذّر إرسال الطلب. حاول مرة أخرى." };
  }

  const publisherId = parseRpcPublisherId(data);
  if (!publisherId) {
    console.error("[submitPublisherApplication] missing publisherId in RPC response", data);
    return { ok: false, reason: "invalid_response", message: "تعذّر فتح مساحة الناشر. حاول من قائمة صفحات الناشر." };
  }
  return { ok: true, publisherId };
}

export type UpdatePublisherWorkspaceInput = {
  name?: string;
  bio?: string;
  logoUrl?: string;
  coverUrl?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
};

export async function updatePublisherWorkspace(
  publisherId: string,
  input: UpdatePublisherWorkspaceInput,
): Promise<{ ok: boolean; readinessScore?: number; message?: string }> {
  const { data, error } = await supabase.rpc("update_publisher_workspace", {
    p_id: publisherId,
    p_name: input.name ?? null,
    p_bio: input.bio ?? null,
    p_logo_url: input.logoUrl ?? null,
    p_cover_url: input.coverUrl ?? null,
    p_phone: input.phone ?? null,
    p_email: input.email ?? null,
    p_website_url: input.websiteUrl ?? null,
    p_facebook_url: input.facebookUrl ?? null,
    p_youtube_url: input.youtubeUrl ?? null,
  });

  if (error) {
    console.error("[updatePublisherWorkspace]", error);
    return { ok: false, message: "تعذّر حفظ التعديلات." };
  }

  const payload = data as { readinessScore?: number } | null;
  return { ok: true, readinessScore: payload?.readinessScore };
}

export async function updatePublisherHeroCards(
  publisherId: string,
  contentIds: string[],
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("update_publisher_hero_cards", {
    p_publisher_id: publisherId,
    p_content_ids: contentIds,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("forbidden")) {
      return { ok: false, message: "لا تملك صلاحية تعديل كروت الهيرو." };
    }
    if (msg.includes("invalid_content")) {
      return { ok: false, message: "أحد عناصر الكروت غير تابع لهذه الصفحة." };
    }
    if (msg.includes("Could not find the function")) {
      return { ok: false, message: "تعديل كروت الهيرو يتطلب تحديث قاعدة البيانات." };
    }
    console.error("[updatePublisherHeroCards]", error);
    return { ok: false, message: "تعذّر حفظ كروت الهيرو." };
  }

  return { ok: true };
}

export async function fetchPublisherContent(publisherId: string): Promise<PublisherContentItem[]> {
  const { data, error } = await supabase
    .from("publisher_content_items")
    .select(CONTENT_SELECT)
    .eq("publisher_id", publisherId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[fetchPublisherContent]", error.message);
    return [];
  }

  return (data as PublisherContentRow[]).map(mapContentFromRow);
}

export type SubmitPublisherContentInput = {
  kind: PublisherContentKind;
  title: string;
  description?: string;
  coverUrl?: string;
  mediaUrl?: string;
  visibility?: PublisherContentVisibility;
  allowDownload?: boolean;
  durationSeconds?: number | null;
  legalConsent?: boolean;
  payload?: Record<string, unknown>;
};

export async function submitPublisherContent(
  publisherId: string,
  input: SubmitPublisherContentInput,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("submit_publisher_content", {
    p_publisher_id: publisherId,
    p_kind: input.kind,
    p_title: input.title.trim(),
    p_description: input.description?.trim() || null,
    p_cover_url: input.coverUrl?.trim() || null,
    p_payload: input.payload ?? {},
    p_visibility: input.visibility ?? "public",
    p_allow_download: input.allowDownload ?? false,
    p_duration_seconds: input.durationSeconds ?? null,
    p_media_url: input.mediaUrl?.trim() || null,
    p_legal_consent: input.legalConsent === true,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("legal_consent_required")) {
      return { ok: false, message: "يجب الموافقة على إقرار حقوق النشر." };
    }
    if (msg.includes("invalid_publisher_state") || msg.includes("suspended")) {
      return { ok: false, message: "لا يمكن إضافة محتوى في حالة الصفحة الحالية." };
    }
    if (msg.includes("forbidden")) {
      return { ok: false, message: "لا تملك صلاحية إدارة المحتوى." };
    }
    console.error("[submitPublisherContent]", error);
    return { ok: false, message: "تعذّر إرسال المحتوى للمراجعة." };
  }

  return { ok: true };
}

export type UpdatePublisherContentInput = {
  title?: string;
  description?: string;
  coverUrl?: string;
  mediaUrl?: string;
  visibility?: PublisherContentVisibility;
  allowDownload?: boolean;
  durationSeconds?: number | null;
  legalConsent?: boolean;
  payload?: Record<string, unknown>;
};

export async function updatePublisherContentItem(
  contentId: string,
  input: UpdatePublisherContentInput,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("update_publisher_content", {
    p_content_id: contentId,
    p_title: input.title?.trim() ?? null,
    p_description: input.description?.trim() ?? null,
    p_cover_url: input.coverUrl?.trim() ?? null,
    p_media_url: input.mediaUrl?.trim() ?? null,
    p_payload: input.payload ?? null,
    p_visibility: input.visibility ?? null,
    p_allow_download: input.allowDownload ?? null,
    p_duration_seconds: input.durationSeconds ?? null,
    p_legal_consent: input.legalConsent === true,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("legal_consent_required")) {
      return { ok: false, message: "يجب الموافقة على إقرار حقوق النشر." };
    }
    if (msg.includes("forbidden")) {
      return { ok: false, message: "لا تملك صلاحية تعديل المحتوى." };
    }
    if (msg.includes("Could not find the function") || msg.includes("update_publisher_content")) {
      return { ok: false, message: "تعديل المحتوى يتطلب تحديث قاعدة البيانات — تواصل مع الدعم." };
    }
    console.error("[updatePublisherContentItem]", error);
    return { ok: false, message: "تعذّر حفظ التعديلات." };
  }

  return { ok: true };
}

export async function submitPublisherForPublication(
  publisherId: string,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("submit_publisher_for_publication", { p_id: publisherId });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("readiness_incomplete")) {
      return { ok: false, message: "أكمل متطلبات الجاهزية (100%) قبل الإرسال." };
    }
    console.error("[submitPublisherForPublication]", error);
    return { ok: false, message: "تعذّر إرسال الصفحة للمراجعة." };
  }

  return { ok: true };
}

export async function fetchApprovedPublisherContent(publisherId: string): Promise<PublisherContentItem[]> {
  const { data, error } = await supabase
    .from("publisher_content_items")
    .select(CONTENT_SELECT)
    .eq("publisher_id", publisherId)
    .eq("status", "approved")
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data as PublisherContentRow[]).map(mapContentFromRow);
}
