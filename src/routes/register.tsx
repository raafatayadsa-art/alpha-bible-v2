import { createFileRoute } from "@tanstack/react-router";
import { AlphaPremiumSignUpScreen } from "@/components/auth/AlphaPremiumSignUpScreen";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [
    { title: "Sign Up — Alpha" },
    { name: "description", content: "Create your Alpha account and begin your spiritual journey." },
    { property: "og:title", content: "Sign Up — Alpha" },
    { property: "og:description", content: "Create your Alpha account and begin your spiritual journey." },
  ] }),
  component: AlphaPremiumSignUpScreen,
});