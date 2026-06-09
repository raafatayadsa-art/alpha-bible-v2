import { createFileRoute } from "@tanstack/react-router";
import { BibleHomeScreen } from "@/features/bible-home";

export const Route = createFileRoute("/bible")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الكتاب المقدس — Alpha Bible" },
      {
        name: "description",
        content: "تنقّل في العهدين القديم والجديد، تابع قراءاتك، واحفظ آياتك المفضلة.",
      },
    ],
  }),
  component: BibleHomeScreen,
});
