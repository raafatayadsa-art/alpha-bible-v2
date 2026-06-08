import { useCallback, useEffect, useState } from "react";
import type { ChurchPost } from "@/data/church-posts";
import { isExpired, isPinned } from "./post-store";
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
    .sort((a, b) => Number(isPinned(b, now)) - Number(isPinned(a, now)));
}

export function useChurchPosts(churchId: string | null | undefined, opts?: { archived?: boolean }) {
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
      setPosts(opts?.archived ? rows : sortActivePosts(rows));
    } catch (e) {
      console.error("useChurchPosts", e);
      setError("تعذّر تحميل المنشورات");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [churchId, opts?.archived]);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(CHURCH_POSTS_CHANGED, onChange);
    return () => window.removeEventListener(CHURCH_POSTS_CHANGED, onChange);
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
