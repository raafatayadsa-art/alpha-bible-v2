import { createFileRoute } from "@tanstack/react-router";
import { AlphaMessagingSystem } from "@/components/alpha/AlphaMessagingSystem";
import { useAlphaPresenceBootstrap, usePresenceStoreVersion } from "@/features/alpha-connect/useAlphaPresence";

export const Route = createFileRoute("/messages")({
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
  component: MessagesPage,
});

function MessagesPage() {
  useAlphaPresenceBootstrap();
  usePresenceStoreVersion();
  const { contactId, name, role, phone, from, screen } = Route.useSearch();
  const initialContact =
    contactId && name
      ? { id: contactId, name, role: role ?? ("priest" as const), phone }
      : undefined;

  return (
    <AlphaMessagingSystem
      initialContact={initialContact}
      returnTo={from}
      initialScreen={screen}
    />
  );
}