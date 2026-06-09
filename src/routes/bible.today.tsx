import { createFileRoute } from "@tanstack/react-router";
import { BibleSubpagePlaceholder } from "@/features/bible-home/BibleSubpagePlaceholder";

export const Route = createFileRoute("/bible/today")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "في مثل هذا اليوم — Alpha Bible" },
      { name: "description", content: "أحداث كتابية في مثل هذا اليوم." },
    ],
  }),
  component: () => (
    <BibleSubpagePlaceholder
      title="في مثل هذا اليوم"
      description="ستتمكن قريباً من اكتشاف ما حدث في الكتاب المقدس في مثل هذا اليوم."
    />
  ),
});
