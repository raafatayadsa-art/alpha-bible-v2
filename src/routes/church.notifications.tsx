import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAlphaNotifications } from "@/components/navigation/AlphaNotificationsProvider";

export const Route = createFileRoute("/church/notifications")({
  ssr: false,
  head: () => ({
    meta: [{ title: "إشعارات — ألفا" }],
  }),
  component: ChurchNotificationsRedirect,
});

/** Legacy URL — open overlay and return; no standalone page. */
function ChurchNotificationsRedirect() {
  const router = useRouter();
  const { openNotifications } = useAlphaNotifications();

  useEffect(() => {
    openNotifications();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      void router.navigate({ to: "/home" });
    }
  }, [openNotifications, router]);

  return null;
}
