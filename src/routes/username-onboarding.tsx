import { createFileRoute } from "@tanstack/react-router";
import { UsernameOnboardingScreen } from "@/components/profile-onboarding/UsernameOnboardingScreen";

export const Route = createFileRoute("/username-onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose Your Alpha Username — ألفا" },
      {
        name: "description",
        content: "اختر هوية ألفا الدائمة الخاصة بك لإكمال إعداد حسابك.",
      },
    ],
  }),
  component: UsernameOnboardingScreen,
});
