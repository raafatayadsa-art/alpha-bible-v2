import { useCallback, useEffect, useState } from "react";
import { loadAlphaConnectSettings } from "@/components/alpha/AlphaConnectSettings";
import { getAuthUserSync } from "@/features/auth";
import { retentionPolicyFromSettings } from "./retention";
import {
  listAlphaConnectMessages,
  markAlphaConnectMessageRead,
  openAlphaConnectConversation,
  purgeExpiredAlphaConnectMessages,
  sendAlphaConnectTextMessage,
  sendAlphaConnectVoiceMessage,
  subscribeAlphaConnectMessages,
} from "./messages-api";
import { uploadAlphaConnectAudio } from "./storage-api";
import type { AlphaConnectMessage, AlphaConnectThreadScope } from "./types";

type UseAlphaConnectThreadOptions = {
  scope: AlphaConnectThreadScope;
  groupCode?: string;
  groupTitle?: string;
  enabled?: boolean;
};

export function useAlphaConnectThread(options: UseAlphaConnectThreadOptions) {
  const { scope, groupCode, groupTitle, enabled = true } = options;
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AlphaConnectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    if (!conversationId) return;
    try {
      await purgeExpiredAlphaConnectMessages();
      const rows = await listAlphaConnectMessages(conversationId);
      setMessages(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تحميل الرسائل");
    }
  }, [conversationId]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const user = getAuthUserSync();
        if (!user?.id) {
          setError("سجّل الدخول لاستخدام Alpha Connect");
          setLoading(false);
          return;
        }

        await purgeExpiredAlphaConnectMessages();
        const id = await openAlphaConnectConversation(scope, { groupCode, title: groupTitle });
        if (cancelled) return;
        setConversationId(id);
        const rows = await listAlphaConnectMessages(id);
        if (cancelled) return;
        setMessages(rows);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "تعذّر فتح المحادثة");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, scope, groupCode, groupTitle]);

  useEffect(() => {
    if (!conversationId || !enabled) return;
    return subscribeAlphaConnectMessages(conversationId, () => {
      void refresh();
    });
  }, [conversationId, enabled, refresh]);

  const sendText = useCallback(
    async (body: string) => {
      const user = getAuthUserSync();
      if (!user?.id || !conversationId || !body.trim()) return false;
      setSending(true);
      try {
        const settings = loadAlphaConnectSettings();
        await sendAlphaConnectTextMessage({
          conversationId,
          senderId: user.id,
          body,
          retentionPolicy: retentionPolicyFromSettings(settings.ephemeralDelete),
        });
        await refresh();
        return true;
      } catch {
        setError("تعذّر إرسال الرسالة");
        return false;
      } finally {
        setSending(false);
      }
    },
    [conversationId, refresh],
  );

  const sendVoice = useCallback(
    async (blob: Blob, durationMs: number, kind: "voice" | "ptt" = "ptt") => {
      const user = getAuthUserSync();
      if (!user?.id || !conversationId) return false;
      setSending(true);
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
        await refresh();
        return true;
      } catch {
        setError("تعذّر إرسال الرسالة الصوتية");
        return false;
      } finally {
        setSending(false);
      }
    },
    [conversationId, refresh],
  );

  const markRead = useCallback(async (messageId: string) => {
    try {
      await markAlphaConnectMessageRead(messageId);
      await refresh();
    } catch {
      /* ignore */
    }
  }, [refresh]);

  return {
    conversationId,
    messages,
    loading,
    error,
    sending,
    sendText,
    sendVoice,
    markRead,
    refresh,
  };
}
