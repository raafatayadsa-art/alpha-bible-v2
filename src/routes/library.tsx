import { createFileRoute } from '@tanstack/react-router'
import { LibraryHubScreen } from "@/features/library/LibraryHubScreen";

export const Route = createFileRoute("/library")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — المكتبة" },
      { name: "description", content: "كتب ومخطوطات ومقالات من مكتبات Alpha الموثوقة." },
    ],
  }),
  component: LibraryHubScreen,
});
