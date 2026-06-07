import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { ApprovalsCenterScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/approvals")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Approvals Center — Alpha Control" }],
  }),
  component: PlatformApprovalsRoute,
});

function PlatformApprovalsRoute() {
  const isList = useRouterState({
    select: (s) => s.location.pathname.replace(/\/+$/, "") === "/platform/approvals",
  });

  return (
    <PlatformAccessGate>
      {isList ? <ApprovalsCenterScreen /> : <Outlet />}
    </PlatformAccessGate>
  );
}
