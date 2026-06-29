import { createFileRoute } from "@tanstack/react-router";
import { CommunityAddFriendScreen } from "@/features/community/CommunityAddFriendScreen";

export const Route = createFileRoute("/community/add-friend")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "إضافة صديق — المجتمع" },
      { name: "description", content: "أضف أصدقاء من كنيستك عبر QR أو Alpha ID." },
    ],
  }),
  component: CommunityAddFriendScreen,
});
