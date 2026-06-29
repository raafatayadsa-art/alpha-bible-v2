import { supabase } from "@/integrations/supabase/client";
import { getAuthUserId } from "@/features/auth";
import { deriveAlphaIdShort } from "@/features/identity/alpha-identity";
import { lookupUserByAlphaCode } from "@/features/identity/alpha-identity-lookup";
import { isAuthenticated } from "@/features/church/current-user";
import { fetchChurchDashboard, resolveActiveChurchId } from "@/features/church/church-dashboard-api";
import { getCommunityFriendUserIdsRemote } from "./community-friends-api";

export type DiscoverTabKey = "suggested" | "my_church" | "friends_of_friends" | "new_members";

export type DiscoverConnectionState = "none" | "pending_sent" | "connected";

export type DiscoverMember = {
  userId: string;
  name: string;
  avatarUrl?: string;
  alphaId: string;
  churchName: string;
  serviceLabel?: string;
  roleType?: string;
  mutualFriends: number;
  connectionState: DiscoverConnectionState;
  tabHints: DiscoverTabKey[];
  joinedAt?: string;
};

type CandidateSeed = {
  userId: string;
  name: string;
  serviceLabel?: string;
  roleType?: string;
  churchName: string;
  tabHints: DiscoverTabKey[];
  joinedAt?: string;
};

async function fetchConnectionMaps(userIds: string[]) {
  const uid = await getAuthUserId();
  if (!uid || !userIds.length) {
    return { contacts: new Set<string>(), pendingSent: new Set<string>() };
  }

  const { data: contactRows } = await supabase
    .from("alpha_connect_contacts")
    .select("contact_user_id")
    .eq("user_id", uid)
    .in("contact_user_id", userIds);

  const contacts = new Set((contactRows ?? []).map((r) => String(r.contact_user_id)));

  const { data: sent } = await supabase
    .from("alpha_connect_connection_requests")
    .select("to_user_id")
    .eq("from_user_id", uid)
    .eq("status", "pending")
    .in("to_user_id", userIds);

  const pendingSent = new Set((sent ?? []).map((r) => String(r.to_user_id)));

  return { contacts, pendingSent };
}

function resolveState(
  userId: string,
  contacts: Set<string>,
  pendingSent: Set<string>,
): DiscoverConnectionState {
  if (contacts.has(userId)) return "connected";
  if (pendingSent.has(userId)) return "pending_sent";
  return "none";
}

async function fetchProfileMap(userIds: string[]) {
  if (!userIds.length) return new Map<string, { name: string; avatarUrl?: string }>();

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", userIds);

  return new Map(
    (profiles ?? []).map((p) => [
      String(p.user_id),
      {
        name: String(p.display_name ?? "").trim() || "عضو Alpha",
        avatarUrl: p.avatar_url ? String(p.avatar_url) : undefined,
      },
    ]),
  );
}

async function fetchMutualFriendCounts(candidateIds: string[], friendIds: Set<string>) {
  const counts = new Map<string, number>();
  if (!candidateIds.length || !friendIds.size) return counts;

  const { data: rows } = await supabase
    .from("alpha_connect_contacts")
    .select("user_id, contact_user_id")
    .in("user_id", candidateIds);

  for (const row of rows ?? []) {
    const ownerId = String(row.user_id);
    const contactId = String(row.contact_user_id);
    if (!friendIds.has(contactId)) continue;
    counts.set(ownerId, (counts.get(ownerId) ?? 0) + 1);
  }

  return counts;
}

async function fetchFriendsOfFriends(friendIds: string[], uid: string): Promise<CandidateSeed[]> {
  if (!friendIds.length) return [];

  const { data: rows } = await supabase
    .from("alpha_connect_contacts")
    .select("contact_user_id")
    .in("user_id", friendIds);

  const ids = [...new Set((rows ?? []).map((r) => String(r.contact_user_id)).filter((id) => id && id !== uid))];
  if (!ids.length) return [];

  const profiles = await fetchProfileMap(ids);
  return ids.map((userId) => {
    const profile = profiles.get(userId);
    return {
      userId,
      name: profile?.name ?? "عضو Alpha",
      churchName: "—",
      tabHints: ["suggested", "friends_of_friends"] as DiscoverTabKey[],
    };
  });
}

async function fetchRecentChurchMembers(churchId: string, uid: string): Promise<CandidateSeed[]> {
  const { data: rows } = await supabase
    .from("church_memberships")
    .select("user_id, joined_at, created_at")
    .eq("church_id", churchId)
    .eq("status", "active")
    .neq("user_id", uid)
    .order("joined_at", { ascending: false, nullsFirst: false })
    .limit(12);

  const ids = (rows ?? []).map((r) => String(r.user_id)).filter(Boolean);
  if (!ids.length) return [];

  const profiles = await fetchProfileMap(ids);
  return ids.map((userId) => {
    const row = rows?.find((r) => String(r.user_id) === userId);
    const profile = profiles.get(userId);
    const joinedAt = row?.joined_at ? String(row.joined_at) : row?.created_at ? String(row.created_at) : undefined;
    return {
      userId,
      name: profile?.name ?? "عضو Alpha",
      churchName: "—",
      tabHints: ["suggested", "new_members"] as DiscoverTabKey[],
      joinedAt,
      roleType: "member",
    };
  });
}

function mergeCandidates(seeds: CandidateSeed[]): CandidateSeed[] {
  const byId = new Map<string, CandidateSeed>();

  for (const seed of seeds) {
    const existing = byId.get(seed.userId);
    if (!existing) {
      byId.set(seed.userId, seed);
      continue;
    }
    byId.set(seed.userId, {
      ...existing,
      name: existing.name || seed.name,
      serviceLabel: existing.serviceLabel ?? seed.serviceLabel,
      roleType: existing.roleType ?? seed.roleType,
      churchName: existing.churchName !== "—" ? existing.churchName : seed.churchName,
      joinedAt: existing.joinedAt ?? seed.joinedAt,
      tabHints: [...new Set([...existing.tabHints, ...seed.tabHints])],
    });
  }

  return [...byId.values()];
}

export async function searchDiscoverMemberByQuery(query: string): Promise<DiscoverMember | null> {
  const q = query.trim();
  if (!q) return null;

  const identity = await lookupUserByAlphaCode(q);
  if (!identity) return null;

  const uid = await getAuthUserId();
  if (uid && identity.userId === uid) return null;

  const { contacts, pendingSent } = await fetchConnectionMaps([identity.userId]);
  return {
    userId: identity.userId,
    name: identity.displayName,
    avatarUrl: identity.avatarUrl,
    alphaId: identity.alphaIdShort,
    churchName: "—",
    mutualFriends: 0,
    connectionState: resolveState(identity.userId, contacts, pendingSent),
    tabHints: ["suggested"],
  };
}

export async function fetchDiscoverMembers(): Promise<DiscoverMember[]> {
  if (!isAuthenticated()) return [];

  const uid = await getAuthUserId();
  if (!uid) return [];

  const dashboard = await fetchChurchDashboard();
  const churchName = dashboard?.church.name?.trim() || "—";
  const churchId = await resolveActiveChurchId();

  const friendIds = new Set(await getCommunityFriendUserIdsRemote());

  const churchSeeds: CandidateSeed[] = (dashboard?.contacts ?? [])
    .map((c) => ({
      userId: c.userId ?? "",
      name: c.name,
      serviceLabel: c.role,
      roleType: c.roleType,
      churchName,
      tabHints: ["suggested", "my_church"] as DiscoverTabKey[],
    }))
    .filter((c) => c.userId && c.userId !== uid && !friendIds.has(c.userId));

  const [fofSeeds, newSeeds] = await Promise.all([
    fetchFriendsOfFriends([...friendIds], uid),
    churchId ? fetchRecentChurchMembers(String(churchId), uid) : Promise.resolve([]),
  ]);

  const merged = mergeCandidates([
    ...churchSeeds,
    ...fofSeeds.filter((s) => !friendIds.has(s.userId)),
      ...newSeeds
      .filter((s) => !friendIds.has(s.userId))
      .map((s) => ({ ...s, churchName, roleType: s.roleType ?? "member" })),
  ]).filter((c) => c.userId !== uid && !friendIds.has(c.userId));

  const userIds = merged.map((c) => c.userId);
  const [profileMap, connectionMaps, mutualCounts] = await Promise.all([
    fetchProfileMap(userIds),
    fetchConnectionMaps(userIds),
    fetchMutualFriendCounts(userIds, friendIds),
  ]);

  return merged.map((c) => {
    const profile = profileMap.get(c.userId);
    return {
      userId: c.userId,
      name: profile?.name ?? c.name,
      avatarUrl: profile?.avatarUrl,
      alphaId: deriveAlphaIdShort(c.userId),
      churchName: c.churchName,
      serviceLabel: c.serviceLabel,
      roleType: c.roleType,
      mutualFriends: mutualCounts.get(c.userId) ?? 0,
      connectionState: resolveState(c.userId, connectionMaps.contacts, connectionMaps.pendingSent),
      tabHints: c.tabHints,
      joinedAt: c.joinedAt,
    };
  });
}

export function filterDiscoverMembers(
  members: DiscoverMember[],
  tab: DiscoverTabKey,
  query: string,
): DiscoverMember[] {
  const q = query.trim().toLowerCase();
  let list = members.filter((m) => m.tabHints.includes(tab));

  if (q) {
    list = members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.alphaId.toLowerCase().includes(q) ||
        m.churchName.toLowerCase().includes(q),
    );
  }

  return list;
}

export function pickNewMembersCarousel(members: DiscoverMember[], limit = 8): DiscoverMember[] {
  return members
    .filter((m) => m.tabHints.includes("new_members") && m.connectionState === "none")
    .sort((a, b) => {
      const aTime = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
      const bTime = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

