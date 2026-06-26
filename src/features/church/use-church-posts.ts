import { useCallback, useEffect, useState } from "react";
import type { ChurchPost } from "@/data/church-posts";
import { isExpired, isPinned } from "./post-store";
import { filterPublicFeedPosts } from "./trip-organizer/trip-organizer-access";
import { subscribeTripApprovalChanged } from "./trip-organizer/trip-approval-workflow";
import {
  CHURCH_POSTS_CHANGED,
  fetchChurchPostById,
  fetchChurchPosts,
  type CreateChurchPostResult,
  createChurchPost,
} from "./church-posts-api";

function sortActivePosts(posts: ChurchPost[]): ChurchPost[] {
  const now = Date.now();
  return posts
    .filter((p) => !isExpired(p, now))
    .sort((a, b) => {
      const pinDiff = Number(isPinned(b, now)) - Number(isPinned(a, now));
      if (pinDiff !== 0) return pinDiff;
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });
}

export function useChurchPosts(
  churchId: string | null | undefined,
  opts?: { archived?: boolean; includePendingTrips?: boolean },
) {
  const [posts, setPosts] = useState<ChurchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!churchId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchChurchPosts(churchId, { archived: opts?.archived });
      const visible = opts?.includePendingTrips ? rows : filterPublicFeedPosts(rows);
      setPosts(opts?.archived ? visible : sortActivePosts(visible));
    } catch (e) {
      console.error("useChurchPosts", e);
      setError("تعذّر تحميل المنشورات");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [churchId, opts?.archived, opts?.includePendingTrips]);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(CHURCH_POSTS_CHANGED, onChange);
    const unsubTrip = subscribeTripApprovalChanged(onChange);
    return () => {
      window.removeEventListener(CHURCH_POSTS_CHANGED, onChange);
      unsubTrip();
    };
  }, [refresh]);

  return { posts, loading, error, refresh };
}

export async function submitChurchPost(
  churchId: string,
  post: ChurchPost,
  createdBy?: string | null,
): Promise<CreateChurchPostResult> {
  return createChurchPost(churchId, post, createdBy);
}

export function useChurchPost(id: string) {
  const [post, setPost] = useState<ChurchPost | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const key = (id ?? "").trim();
    if (!key) {
      setPost(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const row = await fetchChurchPostById(key);
    setPost(row);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(CHURCH_POSTS_CHANGED, onChange);
    return () => window.removeEventListener(CHURCH_POSTS_CHANGED, onChange);
  }, [refresh]);

  return { post, loading };
}
