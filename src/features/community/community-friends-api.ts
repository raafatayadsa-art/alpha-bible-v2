import { supabase } from "@/integrations/supabase/client";
import { getAuthUserId } from "@/features/auth";
import { deriveAlphaIdShort } from "@/features/identity/alpha-identity";
import { isAuthenticated } from "@/features/church/current-user";
import type { CommunityFriend } from "./community-friends-store";
import { COMMUNITY_FRIENDS_CHANGED, getCommunityFriends } from "./community-friends-store";

const STORAGE_KEY = "ab:community-friends-v1";

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Ⲁ";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`;
}

function isMissingFriendsTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return error.code === "42P01" || msg.includes("alpha_connect_contacts");
}

export async function fetchRemoteCommunityFriends(): Promise<CommunityFriend[]> {
  if (!isAuthenticated()) return [];

  const uid = await getAuthUserId();
  if (!uid) return [];

  const { data: contactRows, error: contactsError } = await supabase
    .from("alpha_connect_contacts")
    .select("contact_user_id, created_at")
    .eq("user_id", uid);

  if (contactsError) {
    if (isMissingFriendsTable(contactsError)) return getCommunityFriends();
    console.error("[community-friends] contacts", contactsError.message);
    return getCommunityFriends();
  }

  const ids = (contactRows ?? []).map((r) => String(r.contact_user_id)).filter(Boolean);
  if (!ids.length) return [];

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", ids);

  const byId = new Map(
    (profiles ?? []).map((p) => [
      String(p.user_id),
      {
        name: String(p.display_name ?? "").trim() || "عضو Alpha",
        avatarUrl: p.avatar_url ? String(p.avatar_url) : undefined,
      },
    ]),
  );

  return ids.map((contactId) => {
    const profile = byId.get(contactId);
    const row = contactRows?.find((r) => String(r.contact_user_id) === contactId);
    return {
      id: `remote-${contactId}`,
      linkedUserId: contactId,
      name: profile?.name ?? "عضو Alpha",
      avatarUrl: profile?.avatarUrl,
      alphaId: deriveAlphaIdShort(contactId),
      role: "صديق",
      addedAt: row?.created_at ? String(row.created_at) : new Date().toISOString(),
    } satisfies CommunityFriend;
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type FriendRequestOutcome = "sent" | "invalid" | "failed";

export async function requestCommunityFriendConnection(toUserId: string, note?: string): Promise<boolean> {
  if (!toUserId || !isAuthenticated()) return false;
  const { error } = await supabase.rpc("alpha_send_connection_request", {
    p_to_user_id: toUserId,
    p_note: note ?? "طلب صداقة من المجتمع",
  });
  if (error) {
    console.error("[community-friends] request", error.message);
    return false;
  }
  return true;
}

export async function sendFriendRequestFromUserId(
  toUserId: string | null | undefined,
  note = "طلب صداقة من المجتمع",
): Promise<FriendRequestOutcome> {
  if (!toUserId || !UUID_RE.test(toUserId)) return "invalid";
  const ok = await requestCommunityFriendConnection(toUserId, note);
  return ok ? "sent" : "failed";
}

function mergeFriendsLocal(remote: CommunityFriend[]): CommunityFriend[] {
  const local = getCommunityFriends();
  const byKey = new Map<string, CommunityFriend>();

  for (const f of remote) {
    const key = f.linkedUserId ?? f.alphaId ?? f.id;
    byKey.set(key, f);
  }
  for (const f of local) {
    const key = f.linkedUserId ?? f.alphaId ?? f.id;
    if (!byKey.has(key)) byKey.set(key, f);
  }

  return [...byKey.values()].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
}

export async function syncCommunityFriendsFromRemote(): Promise<CommunityFriend[]> {
  const remote = await fetchRemoteCommunityFriends();
  const merged = mergeFriendsLocal(remote);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event(COMMUNITY_FRIENDS_CHANGED));
  }
  const { syncCommunityFeed } = await import("./community-store");
  const { getCachedMemberChurch } = await import("@/features/church/member-church-api");
  void syncCommunityFeed(getCachedMemberChurch()?.id);
  return merged;
}

export async function getCommunityFriendUserIdsRemote(): Promise<string[]> {
  const friends = await fetchRemoteCommunityFriends();
  return friends.map((f) => f.linkedUserId).filter(Boolean) as string[];
}

export type PendingConnectionRequest = {
  id: string;
  fromUserId: string;
  fromName: string;
  fromAvatarUrl?: string;
  note?: string;
  createdAt: string;
};

export async function fetchPendingConnectionRequestsReceived(): Promise<PendingConnectionRequest[]> {
  if (!isAuthenticated()) return [];

  const uid = await getAuthUserId();
  if (!uid) return [];

  const { data: rows, error } = await supabase
    .from("alpha_connect_connection_requests")
    .select("id, from_user_id, note, created_at")
    .eq("to_user_id", uid)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[community-friends] pending", error.message);
    return [];
  }

  const ids = (rows ?? []).map((r) => String(r.from_user_id)).filter(Boolean);
  if (!ids.length) return [];

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", ids);

  const byId = new Map(
    (profiles ?? []).map((p) => [
      String(p.user_id),
      {
        name: String(p.display_name ?? "").trim() || "عضو Alpha",
        avatarUrl: p.avatar_url ? String(p.avatar_url) : undefined,
      },
    ]),
  );

  return (rows ?? []).map((row) => {
    const fromUserId = String(row.from_user_id);
    const profile = byId.get(fromUserId);
    return {
      id: String(row.id),
      fromUserId,
      fromName: profile?.name ?? "عضو Alpha",
      fromAvatarUrl: profile?.avatarUrl,
      note: row.note ? String(row.note) : undefined,
      createdAt: String(row.created_at ?? new Date().toISOString()),
    } satisfies PendingConnectionRequest;
  });
}

export async function respondCommunityConnectionRequest(
  requestId: string,
  accept: boolean,
): Promise<boolean> {
  const { error } = await supabase.rpc("alpha_respond_connection_request", {
    p_request_id: requestId,
    p_accept: accept,
  });
  if (error) {
    console.error("[community-friends] respond", error.message);
    return false;
  }
  await syncCommunityFriendsFromRemote();
  return true;
}

export async function removeCommunityContactRemote(contactUserId: string): Promise<boolean> {
  if (!contactUserId || !isAuthenticated()) return false;
  const { error } = await supabase.rpc("alpha_remove_community_contact", {
    p_contact_user_id: contactUserId,
  });
  if (error) {
    console.error("[community-friends] remove", error.message);
    return false;
  }
  await syncCommunityFriendsFromRemote();
  return true;
}

export type SentConnectionRequest = {
  id: string;
  toUserId: string;
  toName: string;
  toAvatarUrl?: string;
  createdAt: string;
};

export async function fetchPendingConnectionRequestsSent(): Promise<SentConnectionRequest[]> {
  if (!isAuthenticated()) return [];

  const uid = await getAuthUserId();
  if (!uid) return [];

  const { data: rows, error } = await supabase
    .from("alpha_connect_connection_requests")
    .select("id, to_user_id, created_at")
    .eq("from_user_id", uid)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[community-friends] sent", error.message);
    return [];
  }

  const ids = (rows ?? []).map((r) => String(r.to_user_id)).filter(Boolean);
  if (!ids.length) return [];

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", ids);

  const byId = new Map(
    (profiles ?? []).map((p) => [
      String(p.user_id),
      {
        name: String(p.display_name ?? "").trim() || "عضو Alpha",
        avatarUrl: p.avatar_url ? String(p.avatar_url) : undefined,
      },
    ]),
  );

  return (rows ?? []).map((row) => {
    const toUserId = String(row.to_user_id);
    const profile = byId.get(toUserId);
    return {
      id: String(row.id),
      toUserId,
      toName: profile?.name ?? "عضو Alpha",
      toAvatarUrl: profile?.avatarUrl,
      createdAt: String(row.created_at ?? new Date().toISOString()),
    } satisfies SentConnectionRequest;
  });
}

export async function cancelCommunityConnectionRequest(requestId: string): Promise<boolean> {
  const uid = await getAuthUserId();
  if (!uid || !requestId) return false;

  const { error } = await supabase
    .from("alpha_connect_connection_requests")
    .update({ status: "cancelled", responded_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("from_user_id", uid)
    .eq("status", "pending");

  if (error) {
    console.error("[community-friends] cancel", error.message);
    return false;
  }
  return true;
}
