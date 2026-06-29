import { createFileRoute } from "@tanstack/react-router";
import { DonateScreen } from "@/features/more/DonateScreen";

export const Route = createFileRoute("/donate")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تبرع — Alpha Bible" },
      { name: "description", content: "ادعم رسالة Alpha Bible والكنيسة." },
    ],
  }),
  component: DonateScreen,
});
