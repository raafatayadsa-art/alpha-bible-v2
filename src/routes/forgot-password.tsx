import { createFileRoute } from "@tanstack/react-router";
import { AlphaForgotPasswordScreen } from "@/components/auth/AlphaAuthScreens";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [
    { title: "استعادة كلمة المرور — Alpha" },
    { name: "description", content: "استعد كلمة مرور حسابك في تطبيق ألفا." },
    { property: "og:title", content: "استعادة كلمة المرور — Alpha" },
    { property: "og:description", content: "استعد كلمة مرور حسابك في تطبيق ألفا." },
  ] }),
  component: AlphaForgotPasswordScreen,
});