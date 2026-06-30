import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/features/church/current-user";
import { getActiveMembershipChurchIds } from "@/features/church/church-membership-api";
import { useChurchDashboard } from "@/features/church/use-church-dashboard";
import { useProfilePeopleLinks } from "@/features/profile/profile-people-store";

export type CommunityPersonSuggestion = {
  id: string;
  name: string;
  role: string;
  roleType?: string;
  avatarUrl?: string;
  initials: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Ⲁ";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`;
}

async function fetchChurchMemberIds(churchIds: string[], uid: string): Promise<string[]> {
  if (!churchIds.length) return [];
  const { data } = await supabase
    .from("church_memberships")
    .select("user_id")
    .in("church_id", churchIds)
    .eq("status", "active")
    .neq("user_id", uid)
    .limit(24);
  return [...new Set((data ?? []).map((r) => String(r.user_id)).filter((id) => UUID_RE.test(id)))];
}

export function useCommunityPeopleSuggestions(limit = 10): CommunityPersonSuggestion[] {
  const { data: dashboard } = useChurchDashboard();
  const { connect } = useProfilePeopleLinks();
  const uid = getCurrentUser().id;
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const churchIds = await getActiveMembershipChurchIds();
      const ids = await fetchChurchMemberIds(churchIds, uid);
      if (cancelled) return;
      setMemberIds(ids);
      if (!ids.length) {
        setMemberNames({});
        return;
      }
      const { data } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids);
      if (cancelled) return;
      const names: Record<string, string> = {};
      const avatars: Record<string, string> = {};
      for (const row of data ?? []) {
        const id = String(row.user_id);
        names[id] = row.display_name?.trim() || "عضو الكنيسة";
        const url = row.avatar_url?.trim();
        if (url) avatars[id] = url;
      }
      setMemberNames(names);
      setAvatarMap((prev) => ({ ...prev, ...avatars }));
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const base = useMemo(() => {
    const byId = new Map<string, CommunityPersonSuggestion>();

    for (const memberId of memberIds) {
      if (!memberId || memberId === uid || byId.has(memberId)) continue;
      byId.set(memberId, {
        id: memberId,
        name: memberNames[memberId] ?? "عضو الكنيسة",
        role: "من كنيستك",
        roleType: "member",
        initials: initialsFrom(memberNames[memberId] ?? "عضو"),
      });
    }

    for (const c of dashboard?.contacts ?? []) {
      const id = c.userId?.trim() ?? "";
      if (!id || !UUID_RE.test(id) || id === uid || byId.has(id)) continue;
      byId.set(id, {
        id,
        name: c.name,
        role: c.role,
        roleType: c.roleType,
        initials: c.initials || initialsFrom(c.name),
      });
    }

    for (const p of connect) {
      if (!p.id || p.id === uid || !UUID_RE.test(p.id) || byId.has(p.id)) continue;
      byId.set(p.id, {
        id: p.id,
        name: p.name,
        role: "Alpha Connect",
        avatarUrl: p.avatarUrl,
        initials: initialsFrom(p.name),
      });
    }

    return [...byId.values()].slice(0, limit);
  }, [connect, dashboard?.contacts, limit, memberIds, memberNames, uid]);

  const idsKey = useMemo(() => base.map((p) => p.id).join(","), [base]);

  useEffect(() => {
    const missing = base.filter((p) => !p.avatarUrl).map((p) => p.id);
    if (!missing.length) return;

    let cancelled = false;
    void supabase
      .from("user_profiles")
      .select("user_id, avatar_url")
      .in("user_id", missing)
      .then(({ data }) => {
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const row of data ?? []) {
          const url = row.avatar_url ? String(row.avatar_url).trim() : "";
          if (url) next[String(row.user_id)] = url;
        }
        setAvatarMap((prev) => ({ ...prev, ...next }));
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey, base]);

  return useMemo(
    () =>
      base.map((p) => ({
        ...p,
        avatarUrl: p.avatarUrl ?? avatarMap[p.id],
      })),
    [avatarMap, base],
  );
}
