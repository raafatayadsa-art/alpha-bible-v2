import { clearAlphaConnectConversation } from "@/features/alpha-connect/messages-api";
import type { Conversation } from "@/components/alpha/messaging-data";

export async function clearConversationForBothParties(conv: Conversation): Promise<void> {
  const scope = conv.kind === "group" ? "group" : "direct";
  await clearAlphaConnectConversation({
    conversationId: conv.conversationId,
    peerKey: conv.kind === "private" ? conv.id : undefined,
    groupCode: conv.kind === "group" ? conv.id : undefined,
    groupTitle: conv.name,
    scope,
    forBoth: true,
  });
}
