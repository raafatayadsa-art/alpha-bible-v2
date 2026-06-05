import { createFileRoute } from "@tanstack/react-router";
import { DirectoryScreen } from "./church.directory";

export const Route = createFileRoute("/churches-directory")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الكنائس والأديرة — ألفا" },
      { name: "description", content: "اكتشف الكنائس والأديرة والمزارات القبطية حولك." },
    ],
  }),
  component: DirectoryScreen,
});
