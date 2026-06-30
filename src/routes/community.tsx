import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { CommunityScreen } from "@/features/community";

export const Route = createFileRoute("/community")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "مجتمعي — ألفا" },
      {
        name: "description",
        content:
          "مجتمعك الكنسي الروحي — شارك قراءاتك وصلواتك مع أصدقائك وكنيستك. بدون منشورات شخصية حرة.",
      },
    ],
  }),
  component: CommunityRouteLayout,
});

function CommunityRouteLayout() {
  const isHub = useRouterState({
    select: (s) => s.location.pathname.replace(/\/+$/, "") === "/community",
  });

  if (isHub) return <CommunityScreen />;
  return <Outlet />;
}
