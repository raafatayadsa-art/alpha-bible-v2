import { useCallback, useEffect, useState } from "react";
import { subscribeAuthContext, waitForAuthUserId } from "@/features/auth";
import {
  listAlphaConnectConversations,
  purgeExpiredAlphaConnectMessages,
  subscribeAlphaConnectInbox,
} from "./messages-api";

export function useAlphaConnectConversations(enabled = true) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAlphaConnectConversations>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => subscribeAuthContext(() => setAuthTick((value) => value + 1)), []);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!enabled) return;
    if (!opts?.silent) setLoading(true);
    const userId = await waitForAuthUserId();
    if (!userId) {
      setRows([]);
      setError("سجّل الدخول لاستخدام Alpha Connect");
      setLoading(false);
      return;
    }
    try {
      await purgeExpiredAlphaConnectMessages();
      const next = await listAlphaConnectConversations();
      setRows(next);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "تعذّر تحميل المحادثات";
      setError(message);
      console.error("[AlphaConnectConversations:refresh]", message, e);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh, authTick]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      void refresh({ silent: true });
    }, 120_000);
    return () => clearInterval(interval);
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return;
    let userId: string | null = null;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      userId = await waitForAuthUserId();
      if (!userId) return;
      unsubscribe = subscribeAlphaConnectInbox(userId, () => {
        void refresh();
      });
    })();

    return () => {
      unsubscribe?.();
    };
  }, [enabled, refresh, authTick]);

  return { rows, loading, error, refresh };
}
