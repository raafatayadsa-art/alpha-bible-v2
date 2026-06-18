import { useMemo } from "react";
import { getAuthUserSync } from "@/features/auth";
import {
  buildConversationList,
  CONVERSATION_CONTACTS,
  type Conversation,
} from "@/components/alpha/messaging-data";
import { useAlphaConnectConversations } from "./useAlphaConnectConversations";

export function useAlphaConnectConversationList(enabled = true) {
  const { rows, loading, error, refresh } = useAlphaConnectConversations(enabled);

  const conversations = useMemo(() => {
    const userId = getAuthUserSync()?.id ?? "";
    return buildConversationList(rows, userId);
  }, [rows]);

  return { conversations, contacts: CONVERSATION_CONTACTS, loading, error, refresh };
}

export type { Conversation };
