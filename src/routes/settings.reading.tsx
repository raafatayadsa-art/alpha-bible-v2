import { createFileRoute } from "@tanstack/react-router";
import { ReadingSettingsScreen } from "@/features/settings/ReadingSettingsScreen";

export const Route = createFileRoute("/settings/reading")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "إعدادات القراءة — Alpha Bible" },
      { name: "description", content: "حجم الخط، الحواشي، وحفظ آخر قراءة." },
    ],
  }),
  component: ReadingSettingsScreen,
});
