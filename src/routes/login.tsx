import { createFileRoute } from "@tanstack/react-router";
import { AlphaLoginScreen } from "@/components/auth/AlphaAuthScreens";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "تسجيل الدخول — Alpha" },
    { name: "description", content: "سجّل دخولك إلى تطبيق ألفا لمتابعة رحلتك الروحية." },
    { property: "og:title", content: "تسجيل الدخول — Alpha" },
    { property: "og:description", content: "سجّل دخولك إلى تطبيق ألفا لمتابعة رحلتك الروحية." },
  ] }),
  component: AlphaLoginScreen,
});