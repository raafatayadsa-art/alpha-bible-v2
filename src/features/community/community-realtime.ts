import { supabase } from "@/integrations/supabase/client";
import { isAuthenticated } from "@/features/church/current-user";
import { COMMUNITY_FRIENDS_CHANGED } from "./community-friends-store";
import { syncCommunityFeed } from "./community-store";

let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

export function bootstrapCommunityRealtime() {
  if (started || typeof window === "undefined" || !isAuthenticated()) return;
  started = true;

  channel = supabase
    .channel("community-hub-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "community_moments" },
      () => {
        void syncCommunityFeed();
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "alpha_connect_connection_requests" },
      () => {
        window.dispatchEvent(new Event(COMMUNITY_FRIENDS_CHANGED));
        void import("./community-friends-api").then(({ syncCommunityFriendsFromRemote }) =>
          syncCommunityFriendsFromRemote(),
        );
      },
    )
    .subscribe();
}

export function teardownCommunityRealtime() {
  if (channel) {
    void supabase.removeChannel(channel);
    channel = null;
  }
  started = false;
}
