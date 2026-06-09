import { createFileRoute } from "@tanstack/react-router";
import { BibleSubpagePlaceholder } from "@/features/bible-home/BibleSubpagePlaceholder";

export const Route = createFileRoute("/bible/timeline")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الخط الزمني — Alpha Bible" },
      { name: "description", content: "الخط الزمني للكتاب المقدس." },
    ],
  }),
  component: () => (
    <BibleSubpagePlaceholder
      title="الخط الزمني"
      description="ستتمكن قريباً من استكشاف الأحداث الكتابية على خط زمني تفاعلي."
    />
  ),
});
