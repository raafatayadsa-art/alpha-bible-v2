import { supabase } from "@/integrations/supabase/client";
import type { PrayerCategory, PrayerRequest, PrayerStatus } from "@/data/prayer-requests";
import { getCurrentUser } from "./current-user";

export const PRAYER_REQUESTS_CHANGED = "ab:prayer-requests";

export function notifyPrayerRequestsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PRAYER_REQUESTS_CHANGED));
  }
}

type PrayerRow = {
  id: string;
  church_id: string;
  user_id: string;
  user_name: string;
  title: string;
  body: string;
  category: string;
  status: PrayerStatus;
  anonymous: boolean;
  visibility: string;
  prayer_count: number;
  created_at: string;
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function ageMinutes(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function mapRowToPrayerRequest(row: PrayerRow, currentUserId: string): PrayerRequest {
  const mine = row.user_id === currentUserId;
  const user = getCurrentUser();
  return {
    id: row.id,
    name: row.anonymous ? "طلب صلاة مجهول" : row.user_name || "عضو الكنيسة",
    title: row.title,
    request: row.body,
    time: formatRelativeTime(row.created_at),
    ageMinutes: ageMinutes(row.created_at),
    prayers: row.prayer_count,
    category: (row.category as PrayerCategory) || "طلبة",
    status: row.status,
    mine,
    anonymous: row.anonymous,
    avatarUrl: row.anonymous ? undefined : mine ? user.avatarUrl : undefined,
  };
}

async function resolveChurchIdForPrayers(): Promise<string | null> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) return null;

  const { data: membership } = await supabase
    .from("church_memberships")
    .select("church_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!membership?.church_id) return null;

  const { data: church } = await supabase
    .from("churches")
    .select("id")
    .eq("id", membership.church_id)
    .eq("status", "approved")
    .maybeSingle();

  return church?.id != null ? String(church.id) : null;
}

export async function fetchCommunityPrayerRequests(churchId?: string | null): Promise<PrayerRequest[]> {
  const resolvedId = churchId ?? (await resolveChurchIdForPrayers());
  if (!resolvedId) return [];

  const user = getCurrentUser();
  const { data, error } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("church_id", resolvedId)
    .eq("visibility", "community")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchCommunityPrayerRequests", error);
    return [];
  }

  return ((data ?? []) as PrayerRow[]).map((row) => mapRowToPrayerRequest(row, user.id));
}

export type CreatePrayerResult = { ok: true; request: PrayerRequest } | { ok: false; error: string };

export async function createPrayerRequest(input: {
  title: string;
  body: string;
  anonymous: boolean;
  category?: PrayerCategory;
}): Promise<CreatePrayerResult> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) return { ok: false, error: "يجب تسجيل الدخول أولاً" };

  const churchId = await resolveChurchIdForPrayers();
  if (!churchId) return { ok: false, error: "لا توجد كنيسة معتمدة مرتبطة بحسابك" };

  const user = getCurrentUser();
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return { ok: false, error: "يرجى ملء جميع الحقول" };

  const { data, error } = await supabase
    .from("prayer_requests")
    .insert({
      church_id: churchId,
      user_id: userId,
      user_name: input.anonymous ? "" : user.name || "عضو الكنيسة",
      title,
      body,
      category: input.category ?? "طلبة",
      status: "active",
      anonymous: input.anonymous,
      visibility: "community",
      prayer_count: 0,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("createPrayerRequest", error);
    return { ok: false, error: error?.message ?? "تعذّر حفظ طلب الصلاة" };
  }

  const request = mapRowToPrayerRequest(data as PrayerRow, userId);
  notifyPrayerRequestsChanged();
  return { ok: true, request };
}

export async function incrementPrayerCount(id: string): Promise<boolean> {
  const { data: row, error: readErr } = await supabase
    .from("prayer_requests")
    .select("prayer_count")
    .eq("id", id)
    .maybeSingle();

  if (readErr || !row) {
    console.error("incrementPrayerCount:read", readErr);
    return false;
  }

  const next = (row.prayer_count ?? 0) + 1;
  const { error } = await supabase.from("prayer_requests").update({ prayer_count: next }).eq("id", id);
  if (error) {
    console.error("incrementPrayerCount:write", error);
    return false;
  }
  notifyPrayerRequestsChanged();
  return true;
}

export async function decrementPrayerCount(id: string): Promise<boolean> {
  const { data: row, error: readErr } = await supabase
    .from("prayer_requests")
    .select("prayer_count")
    .eq("id", id)
    .maybeSingle();

  if (readErr || !row) return false;

  const next = Math.max(0, (row.prayer_count ?? 0) - 1);
  const { error } = await supabase.from("prayer_requests").update({ prayer_count: next }).eq("id", id);
  if (error) {
    console.error("decrementPrayerCount", error);
    return false;
  }
  notifyPrayerRequestsChanged();
  return true;
}

export function prayerStatsFromItems(items: PrayerRequest[]) {
  const active = items.filter((p) => p.status === "active" || p.status === "urgent").length;
  const peoplePrayed = items.reduce((s, p) => s + p.prayers, 0);
  return { active, peoplePrayed };
}

export function filterPrayers(items: PrayerRequest[], tab: "all" | "mine" | "urgent" | "answered") {
  switch (tab) {
    case "mine":
      return items.filter((p) => p.mine);
    case "urgent":
      return items.filter((p) => p.status === "urgent");
    case "answered":
      return items.filter((p) => p.status === "answered");
    default:
      return items;
  }
}
