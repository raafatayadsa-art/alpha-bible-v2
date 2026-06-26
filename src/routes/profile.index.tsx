import { createFileRoute } from "@tanstack/react-router";
import { ProfilePremiumScreen } from "@/features/profile";

export const Route = createFileRoute("/profile/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الملف الشخصي" },
      { name: "description", content: "ملفك الشخصي في كنيستك القبطية." },
    ],
  }),
  component: ProfilePremiumScreen,
});
