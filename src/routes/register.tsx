import { createFileRoute } from "@tanstack/react-router";
import { AlphaRegisterScreen } from "@/components/auth/AlphaAuthScreens";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [
    { title: "إنشاء حساب — Alpha" },
    { name: "description", content: "أنشئ حسابًا جديدًا في تطبيق ألفا." },
    { property: "og:title", content: "إنشاء حساب — Alpha" },
    { property: "og:description", content: "أنشئ حسابًا جديدًا في تطبيق ألفا." },
  ] }),
  component: AlphaRegisterScreen,
});