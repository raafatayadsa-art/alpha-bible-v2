import { createFileRoute } from "@tanstack/react-router";
import { AlphaResetPasswordScreen } from "@/components/auth/AlphaAuthScreens";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "كلمة مرور جديدة — Alpha" },
    { name: "description", content: "عيّن كلمة مرور جديدة لحسابك في تطبيق ألفا." },
  ] }),
  component: AlphaResetPasswordScreen,
});