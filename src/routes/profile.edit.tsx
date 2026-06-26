import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditScreen } from "@/features/profile/ProfileEditScreen";

export const Route = createFileRoute("/profile/edit")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — تحرير الملف الشخصي" },
      { name: "description", content: "تعديل بياناتك وخصوصية ملفك الشخصي في Alpha." },
    ],
  }),
  component: ProfileEditScreen,
});
