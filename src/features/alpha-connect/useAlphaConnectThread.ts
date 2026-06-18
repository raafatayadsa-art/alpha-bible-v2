import { useCallback, useEffect, useRef, useState } from "react";
import { loadAlphaConnectSettings } from "@/components/alpha/AlphaConnectSettings";
import { subscribeAuthContext, waitForAuthUserId } from "@/features/auth";
import {
  filterActiveAlphaConnectMessages,
  isOnReadRetentionPolicy,
  normalizeInsertedMessage,
  retentionPolicyFromSettings,
} from "./retention";
import {
  formatAlphaConnectError,
  listAlphaConnectMessages,
  markAlphaConnectMessageRead,
  deleteAlphaConnectMessage,
  openAndEnsureAlphaConnectConversation,
  purgeExpiredAlphaConnectMessages,
  sendAlphaConnectTextMessage,
  sendAlphaConnectVoiceMessage,
  subscribeAlphaConnectMessages,
} from "./messages-api";
import { uploadAlphaConnectAudio } from "./storage-api";
import type { AlphaConnectMessage, AlphaConnectRetentionPolicy, AlphaConnectThreadScope } from "./types";

const EXPIRY_PRUNE_MS = 1_000;
const PURGE_INTERVAL_MS = 120_000;

type UseAlphaConnectThreadOptions = {
  scope: AlphaConnectThreadScope;
  peerKey?: string;
  groupCode?: string;
  groupTitle?: string;
  conversationId?: string | null;
  enabled?: boolean;
  /** Messages before this timestamp skip timed auto-delete (set when user picks timer). */
  timerAnchorMs?: number;
  /** Applies to all messages (both parties) sent after timerAnchorMs. */
  activeRetentionPolicy?: AlphaConnectRetentionPolicy | null;
};

function logConnectThreadFailure(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : formatAlphaConnectError(label, error);
  console.error(`[AlphaConnectThread:${label}]`, message, error);
}

export function useAlphaConnectThread(options: UseAlphaConnectThreadOptions) {
  const {
    scope,
    peerKey,
    groupCode,
    groupTitle,
    conversationId: initialConversationId,
    enabled = true,
    timerAnchorMs = 0,
    activeRetentionPolicy = null,
  } = options;
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AlphaConnectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const conversationIdRef = useRef<string | null>(null);
  const threadKeyRef = useRef("");
  const messagesRef = useRef<AlphaConnectMessage[]>([]);
  const intendedRetentionRef = useRef<Map<string, AlphaConnectRetentionPolicy>>(new Map());

  const mergeRetentionOverlays = useCallback(
    (rows: AlphaConnectMessage[]) => {
      return rows.map((row) => {
        const intended = intendedRetentionRef.current.get(row.id);
        if (intended) return normalizeInsertedMessage(row, intended);

        if (activeRetentionPolicy && timerAnchorMs > 0) {
          const createdMs = new Date(row.created_at).getTime();
          if (Number.isFinite(createdMs) && createdMs >= timerAnchorMs) {
            return normalizeInsertedMessage(row, activeRetentionPolicy);
          }
        }

        return row;
      });
    },
    [activeRetentionPolicy, timerAnchorMs],
  );

  const applyActiveFilter = useCallback(
    (rows: AlphaConnectMessage[]) =>
      filterActiveAlphaConnectMessages(mergeRetentionOverlays(rows), {
        timerAnchorMs,
        nowMs: Date.now(),
      }),
    [mergeRetentionOverlays, timerAnchorMs],
  );

  const threadKey = `${scope}:${peerKey ?? ""}:${groupCode ?? ""}:${initialConversationId ?? ""}`;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => subscribeAuthContext(() => setAuthTick((value) => value + 1)), []);

  useEffect(() => {
    if (threadKeyRef.current === threadKey) return;
    threadKeyRef.current = threadKey;
    setConversationId(null);
    conversationIdRef.current = null;
    setMessages([]);
    setError(null);
    setLoading(true);
  }, [threadKey]);

  const openConversation = useCallback(async () => {
    const userId = await waitForAuthUserId();
    if (!userId) {
      throw new Error("[auth] سجّل الدخول لاستخدام Alpha Connect");
    }

    const result = await openAndEnsureAlphaConnectConversation({
      scope,
      peerKey,
      groupCode,
      groupTitle,
      existingConversationId: initialConversationId,
    });

    return result;
  }, [scope, peerKey, groupCode, groupTitle, initialConversationId]);

  const refresh = useCallback(async (targetConversationId?: string) => {
    const id = targetConversationId ?? conversationIdRef.current;
    if (!id) return;
    try {
      const rows = await listAlphaConnectMessages(id);
      setMessages(applyActiveFilter(rows));
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : formatAlphaConnectError("messages.list", e);
      setError(message);
      logConnectThreadFailure("refresh", e);
    }
  }, [applyActiveFilter]);

  useEffect(() => {
    setMessages((prev) => applyActiveFilter(prev));
  }, [timerAnchorMs, activeRetentionPolicy, applyActiveFilter]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const { conversationId: id } = await openConversation();
        if (cancelled) return;
        setConversationId(id);
        conversationIdRef.current = id;
        const rows = await listAlphaConnectMessages(id);
        if (cancelled) return;
        setMessages(applyActiveFilter(rows));
        setError(null);
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : formatAlphaConnectError("open", e);
          setError(message);
          logConnectThreadFailure("bootstrap", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, openConversation, authTick, threadKey, applyActiveFilter]);

  useEffect(() => {
    if (!conversationId || !enabled) return;
    return subscribeAlphaConnectMessages(conversationId, () => {
      void refresh();
    });
  }, [conversationId, enabled, refresh]);

  useEffect(() => {
    if (!conversationId || !enabled) return;

    const pruneExpired = () => {
      setMessages((prev) => applyActiveFilter(prev));
    };

    const interval = setInterval(pruneExpired, EXPIRY_PRUNE_MS);
    return () => clearInterval(interval);
  }, [conversationId, enabled, applyActiveFilter]);

  useEffect(() => {
    if (!conversationId || !enabled) return;

    const runPurge = () => {
      void purgeExpiredAlphaConnectMessages().then(() => refresh(conversationId));
    };

    const interval = setInterval(runPurge, PURGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [conversationId, enabled, refresh]);

  const ensureConversationId = useCallback(async (): Promise<string | null> => {
    if (conversationIdRef.current) return conversationIdRef.current;
    try {
      const { conversationId: id } = await openConversation();
      setConversationId(id);
      conversationIdRef.current = id;
      setError(null);
      return id;
    } catch (e) {
      const message = e instanceof Error ? e.message : formatAlphaConnectError("ensure", e);
      setError(message);
      logConnectThreadFailure("ensure", e);
      return null;
    }
  }, [openConversation]);

  const sendText = useCallback(
    async (
      body: string,
      retentionOverride?: AlphaConnectRetentionPolicy,
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      const trimmed = body.trim();
      if (!trimmed) return { ok: false, error: "الرسالة فارغة" };

      const activeConversationId = await ensureConversationId();
      if (!activeConversationId) {
        const message = "[open] تعذّر فتح المحادثة قبل الإرسال";
        setError(message);
        return { ok: false, error: message };
      }

      setSending(true);
      try {
        const { userId } = await openAndEnsureAlphaConnectConversation({
          scope,
          peerKey,
          groupCode,
          groupTitle,
          existingConversationId: activeConversationId,
        });

        const settings = loadAlphaConnectSettings();
        const intendedPolicy =
          retentionOverride ?? retentionPolicyFromSettings(settings.ephemeralDelete);
        const inserted = await sendAlphaConnectTextMessage({
          conversationId: activeConversationId,
          senderId: userId,
          body: trimmed,
          retentionPolicy: intendedPolicy,
        });
        const normalized = normalizeInsertedMessage(inserted, intendedPolicy);
        intendedRetentionRef.current.set(normalized.id, intendedPolicy);
        setMessages((prev) => {
          if (prev.some((row) => row.id === normalized.id)) return applyActiveFilter(prev);
          return applyActiveFilter([...prev, normalized]);
        });
        void refresh(activeConversationId);
        setError(null);
        return { ok: true };
      } catch (e) {
        const message = e instanceof Error ? e.message : formatAlphaConnectError("sendText", e);
        setError(message);
        logConnectThreadFailure("sendText", e);
        return { ok: false, error: message };
      } finally {
        setSending(false);
      }
    },
    [ensureConversationId, refresh, scope, peerKey, groupCode, groupTitle, applyActiveFilter],
  );

  const sendVoice = useCallback(
    async (blob: Blob, durationMs: number, kind: "voice" | "ptt" = "ptt") => {
      const activeConversationId = await ensureConversationId();
      if (!activeConversationId) {
        setError((prev) => prev ?? "[open] تعذّر فتح المحادثة قبل الإرسال");
        return false;
      }

      setSending(true);
      try {
        const { userId } = await openAndEnsureAlphaConnectConversation({
          scope,
          peerKey,
          groupCode,
          groupTitle,
          existingConversationId: activeConversationId,
        });

        const settings = loadAlphaConnectSettings();
        const retentionPolicy = retentionPolicyFromSettings(settings.ephemeralDelete);
        const messageId = crypto.randomUUID();
        const audioPath = await uploadAlphaConnectAudio({
          userId,
          conversationId: activeConversationId,
          messageId,
          blob,
        });
        await sendAlphaConnectVoiceMessage({
          conversationId: activeConversationId,
          senderId: userId,
          audioPath,
          durationMs,
          retentionPolicy,
          kind,
        });
        await refresh(activeConversationId);
        setError(null);
        return true;
      } catch (e) {
        const message = e instanceof Error ? e.message : formatAlphaConnectError("sendVoice", e);
        setError(message);
        logConnectThreadFailure("sendVoice", e);
        return false;
      } finally {
        setSending(false);
      }
    },
    [ensureConversationId, refresh, scope, peerKey, groupCode, groupTitle],
  );

  const markRead = useCallback(async (messageId: string) => {
    const target = messagesRef.current.find((row) => row.id === messageId);
    const consumedOnRead = Boolean(target && isOnReadRetentionPolicy(target.retention_policy));

    try {
      await markAlphaConnectMessageRead(messageId);
      if (consumedOnRead) {
        setMessages((prev) => prev.filter((row) => row.id !== messageId));
      }
      await refresh();
    } catch (e) {
      logConnectThreadFailure("markRead", e);
    }
  }, [refresh]);

  const deleteMessage = useCallback(
    async (messageId: string): Promise<{ ok: true } | { ok: false; error: string }> => {
      setMessages((prev) => prev.filter((row) => row.id !== messageId));
      intendedRetentionRef.current.delete(messageId);

      try {
        await deleteAlphaConnectMessage(messageId);
        setError(null);
        return { ok: true };
      } catch (e) {
        const message = e instanceof Error ? e.message : formatAlphaConnectError("deleteMessage", e);
        setError(message);
        logConnectThreadFailure("deleteMessage", e);
        await refresh();
        return { ok: false, error: message };
      }
    },
    [refresh],
  );

  return {
    conversationId,
    messages,
    loading,
    error,
    sending,
    sendText,
    sendVoice,
    markRead,
    deleteMessage,
    refresh,
  };
}
