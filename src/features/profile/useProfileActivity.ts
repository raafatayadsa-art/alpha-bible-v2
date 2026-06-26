import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChurchPost } from "@/data/church-posts";
import { getCurrentUser } from "@/features/church/current-user";
import { listMyRegistrations, subscribePostRegistrations } from "@/features/church/post-registrations";
import { listAttendedPostIds, subscribeChurchPostStore } from "@/features/church/post-store";
import {
  PRAYER_REQUESTS_CHANGED,
  fetchCommunityPrayerRequests,
} from "@/features/church/prayer-requests-api";

export type ProfileActivitySnapshot = {
  lastMass: { title: string; when: string; postId?: string } | null;
  prayerCount: number;
  lastPrayerTitle: string | null;
  attendanceCount: number;
  loading: boolean;
};

const MASS_TYPES = new Set<ChurchPost["type"]>(["liturgy", "meeting", "event"]);

import { formatProfileDate } from "./profile-privacy";

function formatWhen(iso: string): string {
  return formatProfileDate(iso) ?? iso;
}

function resolveLastMass(
  posts: ChurchPost[],
  registrations: ReturnType<typeof listMyRegistrations>,
  attendedIds: string[],
): ProfileActivitySnapshot["lastMass"] {
  const postById = new Map(posts.map((p) => [p.id, p]));
  const candidates: { title: string; when: string; postId: string; ts: number }[] = [];

  for (const reg of registrations) {
    if (reg.kind !== "attendance" && reg.kind !== "event") continue;
    const post = postById.get(reg.postId);
    if (post && MASS_TYPES.has(post.type)) {
      const ts = new Date(reg.registeredAt).getTime();
      candidates.push({
        title: post.title,
        when: formatWhen(reg.registeredAt),
        postId: post.id,
        ts,
      });
    }
  }

  for (const postId of attendedIds) {
    const post = postById.get(postId);
    if (!post || !MASS_TYPES.has(post.type)) continue;
    const ts = post.createdAt ?? Date.now();
    candidates.push({
      title: post.title,
      when: post.date ? post.date : formatWhen(new Date(ts).toISOString()),
      postId: post.id,
      ts,
    });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.ts - a.ts);
  const top = candidates[0];
  return { title: top.title, when: top.when, postId: top.postId };
}

export function useProfileActivity(churchId: string | null | undefined, posts: ChurchPost[]) {
  const [prayerCount, setPrayerCount] = useState(0);
  const [lastPrayerTitle, setLastPrayerTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regTick, setRegTick] = useState(0);
  const [attTick, setAttTick] = useState(0);

  const loadPrayers = useCallback(async () => {
    if (!churchId) {
      setPrayerCount(0);
      setLastPrayerTitle(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await fetchCommunityPrayerRequests(churchId);
      const mine = items.filter((p) => p.mine);
      setPrayerCount(mine.length);
      setLastPrayerTitle(mine[0]?.title ?? null);
    } finally {
      setLoading(false);
    }
  }, [churchId]);

  useEffect(() => {
    void loadPrayers();
    const onPrayers = () => void loadPrayers();
    window.addEventListener(PRAYER_REQUESTS_CHANGED, onPrayers);
    return () => window.removeEventListener(PRAYER_REQUESTS_CHANGED, onPrayers);
  }, [loadPrayers]);

  useEffect(() => {
    const bump = () => {
      setRegTick((n) => n + 1);
      setAttTick((n) => n + 1);
    };
    const unsubReg = subscribePostRegistrations(bump);
    const unsubStore = subscribeChurchPostStore(bump);
    window.addEventListener("storage", bump);
    return () => {
      unsubReg();
      unsubStore();
      window.removeEventListener("storage", bump);
    };
  }, []);

  const activity = useMemo(() => {
    void regTick;
    void attTick;
    const userId = getCurrentUser().id;
    const registrations = listMyRegistrations(userId);
    const attendedIds = listAttendedPostIds();
    const lastMass = resolveLastMass(posts, registrations, attendedIds);
    const attendanceCount = registrations.filter(
      (r) => r.kind === "attendance" || r.kind === "event",
    ).length + attendedIds.length;

    return {
      lastMass,
      prayerCount,
      lastPrayerTitle,
      attendanceCount,
      loading,
    } satisfies ProfileActivitySnapshot;
  }, [posts, prayerCount, lastPrayerTitle, loading, regTick, attTick]);

  return activity;
}
