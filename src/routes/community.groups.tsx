import { createFileRoute } from "@tanstack/react-router";
import { CommunityGroupsScreen } from "@/features/community/CommunityGroupsScreen";

export const Route = createFileRoute("/community/groups")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "المجموعات — المجتمع" },
      { name: "description", content: "اكتشف مجموعات كنيستك على Alpha." },
    ],
  }),
  component: CommunityGroupsScreen,
});
