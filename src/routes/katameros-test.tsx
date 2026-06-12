import { createFileRoute } from "@tanstack/react-router";
import KatamerosTest from "@/pages/KatamerosTest";

export const Route = createFileRoute("/katameros-test")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Katameros Test" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: KatamerosTest,
});
