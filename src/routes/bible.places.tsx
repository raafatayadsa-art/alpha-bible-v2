import { createFileRoute } from "@tanstack/react-router";
import { BibleSubpagePlaceholder } from "@/features/bible-home/BibleSubpagePlaceholder";

export const Route = createFileRoute("/bible/places")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "خريطة الأماكن — Alpha Bible" },
      { name: "description", content: "أماكن الكتاب المقدس على الخريطة." },
    ],
  }),
  component: () => (
    <BibleSubpagePlaceholder
      title="خريطة الأماكن"
      description="ستتمكن قريباً من استكشاف الأماكن الكتابية على خريطة تفاعلية."
    />
  ),
});
