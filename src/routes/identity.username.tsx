import { createFileRoute } from "@tanstack/react-router";
import { AlphaUsernameOnboardingScreen } from "@/components/auth/AlphaUsernameOnboardingScreen";

export const Route = createFileRoute("/identity/username")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose Your Alpha Username — Alpha" },
      { name: "description", content: "Choose your permanent Alpha identity username." },
    ],
  }),
  component: AlphaUsernameOnboardingScreen,
});
