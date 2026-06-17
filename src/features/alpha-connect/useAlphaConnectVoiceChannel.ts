import { useCallback, useRef } from "react";
import { loadAlphaConnectSettings } from "@/components/alpha/AlphaConnectSettings";
import { getAuthUserSync } from "@/features/auth";
import { retentionPolicyFromSettings } from "./retention";
import {
  openAlphaConnectConversation,
  purgeExpiredAlphaConnectMessages,
  sendAlphaConnectVoiceMessage,
} from "./messages-api";
import { uploadAlphaConnectAudio } from "./storage-api";
import type { AlphaConnectThreadScope } from "./types";

type UseAlphaConnectVoiceChannelOptions = {
  scope: AlphaConnectThreadScope;
  groupCode?: string;
  groupTitle?: string;
  enabled?: boolean;
};

/** Voice/PTT upload only — no chat thread UI (Alpha Connect is not a chat app). */
export function useAlphaConnectVoiceChannel(options: UseAlphaConnectVoiceChannelOptions) {
  const { scope, groupCode, groupTitle, enabled = true } = options;
  const conversationIdRef = useRef<string | null>(null);

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (!enabled) return null;
    const user = getAuthUserSync();
    if (!user?.id) return null;
    if (conversationIdRef.current) return conversationIdRef.current;
    await purgeExpiredAlphaConnectMessages();
    const id = await openAlphaConnectConversation(scope, { groupCode, title: groupTitle });
    conversationIdRef.current = id;
    return id;
  }, [enabled, scope, groupCode, groupTitle]);

  const sendVoice = useCallback(
    async (blob: Blob, durationMs: number, kind: "voice" | "ptt" = "ptt") => {
      const user = getAuthUserSync();
      const conversationId = await ensureConversation();
      if (!user?.id || !conversationId) return false;
      try {
        const settings = loadAlphaConnectSettings();
        const retentionPolicy = retentionPolicyFromSettings(settings.ephemeralDelete);
        const messageId = crypto.randomUUID();
        const audioPath = await uploadAlphaConnectAudio({
          userId: user.id,
          conversationId,
          messageId,
          blob,
        });
        await sendAlphaConnectVoiceMessage({
          conversationId,
          senderId: user.id,
          audioPath,
          durationMs,
          retentionPolicy,
          kind,
        });
        return true;
      } catch {
        return false;
      }
    },
    [ensureConversation],
  );

  return { sendVoice };
}
