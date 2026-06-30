import { createFileRoute } from "@tanstack/react-router";
import { ProfileV3Screen } from "@/features/profile/components/ProfileV3Screen";

export const Route = createFileRoute("/profile/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الملف الشخصي" },
      { name: "description", content: "هويتك الروحية في Alpha — ملفك الشخصي الهادئ والمميز." },
    ],
  }),
  component: ProfileV3Screen,
});
