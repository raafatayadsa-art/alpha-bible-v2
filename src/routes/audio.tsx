import { createFileRoute } from "@tanstack/react-router";
import { AudioScreen } from "@/features/audio";

export const Route = createFileRoute("/audio")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الصوتيات والترانيم" },
      { name: "description", content: "ترانيم وعظات وقراءات صوتية روحية." },
    ],
  }),
  component: AudioScreen,
});