import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchDiscoverMembers,
  filterDiscoverMembers,
  pickNewMembersCarousel,
  searchDiscoverMemberByQuery,
  type DiscoverMember,
  type DiscoverTabKey,
} from "./discover-members-api";
import { requestCommunityFriendConnection } from "./community-friends-api";

const TABS: { key: DiscoverTabKey; label: string }[] = [
  { key: "suggested", label: "مقترحون" },
  { key: "my_church", label: "من كنيستي" },
  { key: "friends_of_friends", label: "أصدقاء أصدقائي" },
  { key: "new_members", label: "أعضاء جدد" },
];

export function useDiscoverMembers() {
  const [members, setMembers] = useState<DiscoverMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DiscoverTabKey>("suggested");
  const [query, setQuery] = useState("");
  const [searchHit, setSearchHit] = useState<DiscoverMember | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchDiscoverMembers();
      setMembers(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchHit(null);
      return;
    }
    const t = window.setTimeout(() => {
      void searchDiscoverMemberByQuery(q).then(setSearchHit);
    }, 280);
    return () => window.clearTimeout(t);
  }, [query]);

  const visible = useMemo(() => {
    if (searchHit && query.trim().length >= 2) {
      const inList = members.some((m) => m.userId === searchHit.userId);
      return inList ? filterDiscoverMembers(members, tab, query) : [searchHit];
    }
    return filterDiscoverMembers(members, tab, query);
  }, [members, tab, query, searchHit]);

  const newMembersCarousel = useMemo(() => pickNewMembersCarousel(members), [members]);

  const sendRequest = useCallback(async (userId: string) => {
    const ok = await requestCommunityFriendConnection(userId, "طلب صداقة من اكتشف أعضاء Alpha");
    if (ok) {
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === userId ? { ...m, connectionState: "pending_sent" as const } : m,
        ),
      );
      if (searchHit?.userId === userId) {
        setSearchHit({ ...searchHit, connectionState: "pending_sent" });
      }
    }
    return ok;
  }, [searchHit]);

  return {
    tabs: TABS,
    tab,
    setTab,
    query,
    setQuery,
    visible,
    newMembersCarousel,
    loading,
    refresh,
    sendRequest,
  };
}
