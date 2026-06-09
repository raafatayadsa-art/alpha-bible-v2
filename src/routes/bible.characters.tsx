import { createFileRoute } from "@tanstack/react-router";
import { BibleSubpagePlaceholder } from "@/features/bible-home/BibleSubpagePlaceholder";

export const Route = createFileRoute("/bible/characters")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الشخصيات — Alpha Bible" },
      { name: "description", content: "شخصيات الكتاب المقدس." },
    ],
  }),
  component: () => (
    <BibleSubpagePlaceholder
      title="الشخصيات"
      description="ستتمكن قريباً من استكشاف شخصيات الكتاب المقدس وتتبّع قصصهم."
    />
  ),
});
