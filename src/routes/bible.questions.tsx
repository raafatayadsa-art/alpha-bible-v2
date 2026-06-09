import { createFileRoute } from "@tanstack/react-router";
import { BibleSubpagePlaceholder } from "@/features/bible-home/BibleSubpagePlaceholder";

export const Route = createFileRoute("/bible/questions")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "أسئلة وأجوبة — Alpha Bible" },
      { name: "description", content: "أسئلة وأجوبة عن الكتاب المقدس." },
    ],
  }),
  component: () => (
    <BibleSubpagePlaceholder
      title="أسئلة وأجوبة"
      description="ستتمكن قريباً من طرح الأسئلة واستكشاف إجابات كتابية موثّقة."
    />
  ),
});
