import { createFileRoute } from "@tanstack/react-router";
import { BibleV2Screen } from "@/features/bible-v2";

/** Premium Bible home preview — official /bible is unchanged. */
export const Route = createFileRoute("/bible-2")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الكتاب المقدس 2 — Alpha Bible" },
      { name: "description", content: "تجربة فاخرة لشاشة الكتاب المقدس." },
    ],
  }),
  component: BibleV2Screen,
});
