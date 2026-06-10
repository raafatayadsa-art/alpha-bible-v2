import { createFileRoute } from "@tanstack/react-router";
import { BibleHomeScreen } from "@/features/bible-lavoble/components/alpha/BibleHomeScreen";

/** Temporary test route — imported Lovable Bible screen. Official /bible is unchanged. */
export const Route = createFileRoute("/bible-lovable")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bible (Lovable Preview) — Alpha Bible" },
      { name: "description", content: "معاينة تجريبية لشاشة الكتاب المقدس المستوردة." },
    ],
  }),
  component: BibleHomeScreen,
});
