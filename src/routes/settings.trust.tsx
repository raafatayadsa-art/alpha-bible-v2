import { createFileRoute } from "@tanstack/react-router";
import { TrustSafetyCenter } from "@/features/settings/TrustSafetyCenter";

export const Route = createFileRoute("/settings/trust")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "مركز الثقة والأمان — Alpha" },
      {
        name: "description",
        content: "شفافية كاملة لحماية خصوصيتك وحقوقك داخل Alpha.",
      },
    ],
  }),
  component: TrustSafetyCenter,
});
