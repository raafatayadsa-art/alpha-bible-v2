import { createFileRoute } from "@tanstack/react-router";
import { BibleV2Screen } from "@/features/bible-v2";

export const Route = createFileRoute("/bible/")({
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
  component: BibleV2Screen,
});
