import { createFileRoute } from "@tanstack/react-router";
import { CommunityFriendsScreen } from "@/features/community/CommunityFriendsScreen";

export const Route = createFileRoute("/community/friends")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "أصدقائي — المجتمع" },
      { name: "description", content: "قائمة أصدقائك في مجتمع Alpha." },
    ],
  }),
  component: CommunityFriendsScreen,
});
