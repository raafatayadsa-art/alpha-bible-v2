import { useMemo } from "react";
import { getCurrentUser } from "@/features/church/current-user";
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

export function useCommunityPeopleSuggestions(limit = 10): CommunityPersonSuggestion[] {
  const { data: dashboard } = useChurchDashboard();
  const { connect } = useProfilePeopleLinks();
  const uid = getCurrentUser().id;

  return useMemo(() => {
    const byId = new Map<string, CommunityPersonSuggestion>();

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
  }, [connect, dashboard?.contacts, limit, uid]);
}
