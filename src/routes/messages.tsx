import { createFileRoute, redirect } from "@tanstack/react-router";
import { AlphaMessagingSystem } from "@/components/alpha/AlphaMessagingSystem";
import { useAlphaPresenceBootstrap, usePresenceStoreVersion } from "@/features/alpha-connect/useAlphaPresence";

export const Route = createFileRoute("/messages")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    contactId: typeof search.contactId === "string" ? search.contactId : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
    role:
      search.role === "priest" || search.role === "servant" || search.role === "admin"
        ? search.role
        : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
    screen: search.screen === "settings" ? "settings" as const : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (search.contactId) {
      throw redirect({
        to: "/messages/chat/$contactId",
        params: { contactId: search.contactId },
        search: {
          name: search.name,
          role: search.role,
          phone: search.phone,
          from: search.from,
        },
      });
    }
  },
  component: MessagesPage,
});

function MessagesPage() {
  useAlphaPresenceBootstrap();
  usePresenceStoreVersion();
  const { from, screen } = Route.useSearch();

  return (
    <AlphaMessagingSystem
      returnTo={from}
      initialScreen={screen}
    />
  );
}
