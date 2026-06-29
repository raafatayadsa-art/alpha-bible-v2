import { createFileRoute } from "@tanstack/react-router";
import { CommunitySpiritualRecordScreen } from "@/features/community/CommunitySpiritualRecordScreen";

export const Route = createFileRoute("/community/spiritual-record")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "السجل الروحي — المجتمع" },
      { name: "description", content: "سلسلة أيامك الروحية — قراءة وصلاة وأجبية." },
    ],
  }),
  component: CommunitySpiritualRecordScreen,
});
