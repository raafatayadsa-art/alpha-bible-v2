import { createFileRoute } from "@tanstack/react-router";
import { AlphaControlCenter } from "@/features/settings";

export const Route = createFileRoute("/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "مركز التحكم — Alpha" },
      { name: "description", content: "مركز التحكم الشخصي — إدارة حسابك وخصوصيتك وتجربتك الروحية في Alpha." },
    ],
  }),
  component: AlphaControlCenter,
});
