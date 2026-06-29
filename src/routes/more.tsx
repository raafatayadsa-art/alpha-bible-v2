import { createFileRoute } from "@tanstack/react-router";
import { AlphaMoreScreen } from "@/features/more/AlphaMoreScreen";

export const Route = createFileRoute("/more")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "المزيد — Alpha Bible" },
      { name: "description", content: "روابط سريعة: آية اليوم، التبرع، المشاركة، والإعدادات." },
    ],
  }),
  component: AlphaMoreScreen,
});
