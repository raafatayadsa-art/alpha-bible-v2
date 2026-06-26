import { supabase } from "@/integrations/supabase/client";
import { deriveAlphaIdShort } from "@/features/identity/alpha-identity";
import type { NearbyConnectionStatus, NearbyDiscoveryPrefs, NearbyMember } from "./types";
import { mapNearbyRoleLabel } from "./types";

type NearbyRow = {
  user_id: string;
  display_name: string;
  church_name: string;
  role_label: string;
  distance_m: number;
  avatar_url: string | null;
};

type RequestRow = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
};

const FALLBACK_AVATAR = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6a4ab5&color=fff&size=128&bold=true&rounded=true`;

export function mapNearbyError(err: unknown): string {
  const msg =
    err && typeof err === "object" && "message" in err && typeof err.message === "string"
      ? err.message
      : err instanceof Error
        ? err.message
        : String(err ?? "");

  if (/could not find the function|schema cache/i.test(msg)) {
    return "نظام الأعضاء القريبين غير مفعّل بعد. شغّل supabase/RUN_ALPHA_NEARBY_MEMBERS.sql في Supabase.";
  }
  if (/not authenticated/i.test(msg)) {
    return "سجّل الدخول لتفعيل الاكتشاف القريب.";
  }
  if (/permission denied|row-level security/i.test(msg)) {
    return "لا توجد صلاحية للاكتشاف. تحقق من إعدادات الخصوصية.";
  }
  return "تعذّر تحميل الأعضاء القريبين.";
}

export async function checkNearbyBackendReady(): Promise<{ ready: boolean; error?: string }> {
  const { error } = await supabase.rpc("alpha_nearby_members", {
    p_lat: 30.0,
    p_lng: 31.0,
    p_radius_m: 100,
  });
  if (!error) return { ready: true };
  if (/not authenticated/i.test(error.message)) return { ready: true };
  return { ready: false, error: mapNearbyError(error) };
}

export async function upsertDiscoveryLocation(input: {
  lat: number;
  lng: number;
  accuracyM?: number;
  discoverable?: boolean;
}): Promise<void> {
  const { error } = await supabase.rpc("alpha_upsert_discovery_location", {
    p_lat: input.lat,
    p_lng: input.lng,
    p_accuracy_m: input.accuracyM ?? null,
    p_discoverable: input.discoverable ?? null,
  });
  if (error) throw error;
}

export async function fetchNearbyMembers(input: {
  lat: number;
  lng: number;
  radiusM?: number;
}): Promise<NearbyMember[]> {
  const { data, error } = await supabase.rpc("alpha_nearby_members", {
    p_lat: input.lat,
    p_lng: input.lng,
    p_radius_m: input.radiusM ?? 2000,
  });
  if (error) throw error;

  const rows = (data ?? []) as NearbyRow[];
  const userIds = rows.map((r) => r.user_id);
  const requests = await fetchConnectionRequestsForUsers(userIds);
  const contacts = await fetchContactsSet();

  return rows
    .map((row) => {
      const status = resolveConnectionStatus(row.user_id, requests, contacts);
      return {
        userId: row.user_id,
        displayName: row.display_name,
        avatarUrl: row.avatar_url || FALLBACK_AVATAR(row.display_name),
        role: mapNearbyRoleLabel(row.role_label),
        churchName: row.church_name,
        distanceM: row.distance_m,
        alphaIdShort: deriveAlphaIdShort(row.user_id),
        connectionStatus: status.status,
        connectionRequestId: status.requestId,
        discoverySource: "gps" as const,
      };
    })
    .sort((a, b) => a.distanceM - b.distanceM);
}

async function fetchConnectionRequestsForUsers(userIds: string[]): Promise<RequestRow[]> {
  if (userIds.length === 0) return [];
  const { getAuthUserId } = await import("@/features/auth");
  const uid = await getAuthUserId();
  if (!uid) return [];

  const { data: sent } = await supabase
    .from("alpha_connect_connection_requests")
    .select("id, from_user_id, to_user_id, status")
    .eq("from_user_id", uid)
    .in("to_user_id", userIds)
    .eq("status", "pending");
  const { data: received } = await supabase
    .from("alpha_connect_connection_requests")
    .select("id, from_user_id, to_user_id, status")
    .eq("to_user_id", uid)
    .in("from_user_id", userIds)
    .eq("status", "pending");
  return [...(sent ?? []), ...(received ?? [])] as RequestRow[];
}

async function fetchContactsSet(): Promise<Set<string>> {
  const { getAuthUserId } = await import("@/features/auth");
  const uid = await getAuthUserId();
  if (!uid) return new Set();
  const { data } = await supabase
    .from("alpha_connect_contacts")
    .select("contact_user_id")
    .eq("user_id", uid);
  return new Set((data ?? []).map((r) => r.contact_user_id as string));
}

function resolveConnectionStatus(
  targetUserId: string,
  requests: RequestRow[],
  contacts: Set<string>,
): { status: NearbyConnectionStatus; requestId?: string } {
  if (contacts.has(targetUserId)) return { status: "connected" };
  const received = requests.find((r) => r.from_user_id === targetUserId);
  if (received) return { status: "pending_received", requestId: received.id };
  const sent = requests.find((r) => r.to_user_id === targetUserId);
  if (sent) return { status: "pending_sent", requestId: sent.id };
  return { status: "none" };
}

export async function sendNearbyConnectionRequest(toUserId: string, note?: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("alpha_send_connection_request", {
    p_to_user_id: toUserId,
    p_note: note ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function respondNearbyConnectionRequest(requestId: string, accept: boolean): Promise<boolean> {
  const { data, error } = await supabase.rpc("alpha_respond_connection_request", {
    p_request_id: requestId,
    p_accept: accept,
  });
  if (error) throw error;
  return Boolean(data);
}

export async function loadDiscoveryPrefs(): Promise<NearbyDiscoveryPrefs | null> {
  const { getAuthUserId } = await import("@/features/auth");
  const uid = await getAuthUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from("alpha_user_discovery_prefs")
    .select("nearby_discoverable, who_can_discover")
    .eq("user_id", uid)
    .maybeSingle();
  if (error) return null;
  if (!data) return { nearbyDiscoverable: false, whoCanDiscover: "church" };
  return {
    nearbyDiscoverable: Boolean(data.nearby_discoverable),
    whoCanDiscover: (data.who_can_discover as NearbyDiscoveryPrefs["whoCanDiscover"]) ?? "church",
  };
}

export async function saveDiscoveryPrefs(prefs: NearbyDiscoveryPrefs): Promise<void> {
  const { getAuthUserId } = await import("@/features/auth");
  const uid = await getAuthUserId();
  if (!uid) throw new Error("not authenticated");
  const { error } = await supabase.from("alpha_user_discovery_prefs").upsert({
    user_id: uid,
    nearby_discoverable: prefs.nearbyDiscoverable,
    who_can_discover: prefs.whoCanDiscover,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 30_000,
    });
  });
}

export function geolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "تم رفض إذن الموقع. فعّله من إعدادات المتصفح.";
    case 2:
      return "تعذّر تحديد موقعك حالياً.";
    case 3:
      return "انتهت مهلة تحديد الموقع.";
    default:
      return "تعذّر الوصول للموقع.";
  }
}
