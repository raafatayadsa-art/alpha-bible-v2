import { supabase } from "@/integrations/supabase/client";

export type PublisherFollowState = {
  following: boolean;
  count: number;
};

export async function fetchPublisherFollowState(publisherId: string): Promise<PublisherFollowState> {
  const { data: pub } = await supabase
    .from("publishers")
    .select("follower_count")
    .eq("id", publisherId)
    .maybeSingle();

  const count = (pub as { follower_count?: number } | null)?.follower_count ?? 0;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { following: false, count };

  const { data: row } = await supabase
    .from("publisher_page_follows")
    .select("publisher_id")
    .eq("publisher_id", publisherId)
    .eq("user_id", userId)
    .maybeSingle();

  return { following: Boolean(row), count };
}

export async function togglePublisherFollow(publisherId: string): Promise<PublisherFollowState | null> {
  const { data, error } = await supabase.rpc("toggle_publisher_page_follow", {
    p_publisher_id: publisherId,
  });

  if (error) {
    console.warn("[togglePublisherFollow]", error.message);
    return null;
  }

  const payload = data as { following?: boolean; followerCount?: number } | null;
  return {
    following: payload?.following === true,
    count: typeof payload?.followerCount === "number" ? payload.followerCount : 0,
  };
}
