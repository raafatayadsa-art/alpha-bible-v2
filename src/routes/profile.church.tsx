import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { ProfileSubShell } from "@/components/profile/Shell";
import { ChurchManagementHub } from "@/features/church-management";

export const Route = createFileRoute("/profile/church")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "إدارة الكنيسة — Alpha" },
      { name: "description", content: "مركز إدارة الكنيسة وطلبات التأسيس في Alpha." },
    ],
  }),
  component: ProfileChurchRoute,
});

function ProfileChurchRoute() {
  const isHub = useRouterState({
    select: (s) => s.location.pathname.replace(/\/+$/, "") === "/profile/church",
  });

  if (isHub) return <ChurchManagementPage />;
  return <Outlet />;
}

function ChurchManagementPage() {
  return (
    <ProfileSubShell title="إدارة الكنيسة" brand="full">
      <ChurchManagementHub />
    </ProfileSubShell>
  );
}
