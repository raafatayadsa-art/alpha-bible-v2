import { createFileRoute } from "@tanstack/react-router";
import { DiscoverMembersScreen } from "@/features/community/DiscoverMembersScreen";

export const Route = createFileRoute("/community/discover")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — اكتشف أعضاء Alpha" },
      { name: "description", content: "اكتشف أعضاء Alpha وأضف أصدقاء جدد." },
    ],
  }),
  component: DiscoverMembersScreen,
});
