import { createFileRoute } from "@tanstack/react-router";
import { ReadingHistoryScreen } from "@/features/bible-reader/ReadingHistoryScreen";

export const Route = createFileRoute("/bible/history")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "سجل التاريخ — Alpha Bible" },
      { name: "description", content: "آخر الإصحاحات التي قرأتها." },
    ],
  }),
  component: ReadingHistoryScreen,
});
