import { createFileRoute } from "@tanstack/react-router";
import { ChurchDirectoryScreen } from "@/features/church-directory";

export const Route = createFileRoute("/churches-directory")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "دليل الكنائس — ألفا" },
      { name: "description", content: "اكتشف الكنائس القبطية الأرثوذكسية حولك على خريطة تفاعلية ذكية." },
    ],
  }),
  component: ChurchDirectoryScreen,
});
