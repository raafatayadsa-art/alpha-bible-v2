import { createFileRoute } from "@tanstack/react-router";
import { ProfileSubShell } from "@/components/profile/Shell";
import { ChurchSetupForm } from "@/features/church-management/ChurchSetupForm";

export const Route = createFileRoute("/profile/church/setup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "طلب تأسيس كنيسة — Alpha" },
      { name: "description", content: "نموذج طلب تأسيس كنيسة جديدة في Alpha." },
    ],
  }),
  component: ChurchSetupPage,
});

function ChurchSetupPage() {
  return (
    <ProfileSubShell title="طلب تأسيس كنيسة" brand="logo-only" subtleWatermark>
      <ChurchSetupForm />
    </ProfileSubShell>
  );
}
