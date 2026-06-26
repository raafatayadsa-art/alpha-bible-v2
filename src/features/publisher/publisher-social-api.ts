import { supabase } from "@/integrations/supabase/client";
import type { PublisherRecord } from "./types";
import { shareUrlForPublisher } from "./publisher-identity";

export type PublisherLikeState = {
  liked: boolean;
  count: number;
};

export async function fetchPublisherLikeState(publisherId: string): Promise<PublisherLikeState> {
  const { data: pub } = await supabase
    .from("publishers")
    .select("likes_count")
    .eq("id", publisherId)
    .maybeSingle();

  const count = (pub as { likes_count?: number } | null)?.likes_count ?? 0;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { liked: false, count };

  const { data: row } = await supabase
    .from("publisher_page_likes")
    .select("publisher_id")
    .eq("publisher_id", publisherId)
    .eq("user_id", userId)
    .maybeSingle();

  return { liked: Boolean(row), count };
}

export async function togglePublisherLike(publisherId: string): Promise<PublisherLikeState | null> {
  const { data, error } = await supabase.rpc("toggle_publisher_page_like", {
    p_publisher_id: publisherId,
  });

  if (error) {
    console.warn("[togglePublisherLike]", error.message);
    return null;
  }

  const payload = data as { liked?: boolean; likesCount?: number } | null;
  return {
    liked: payload?.liked === true,
    count: typeof payload?.likesCount === "number" ? payload.likesCount : 0,
  };
}

export async function sharePublisherPage(publisher: Pick<PublisherRecord, "id" | "name" | "bio">): Promise<void> {
  const url = shareUrlForPublisher(publisher.id);
  const text = publisher.bio?.trim() || publisher.name;
  try {
    if (navigator.share) {
      await navigator.share({ title: publisher.name, text, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  } catch {
    /* user cancelled */
  }
}
