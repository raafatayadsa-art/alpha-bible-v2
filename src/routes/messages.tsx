import { createFileRoute } from "@tanstack/react-router";
import { AlphaMessagingSystem } from "@/components/alpha/AlphaMessagingSystem";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  return <AlphaMessagingSystem />;
}