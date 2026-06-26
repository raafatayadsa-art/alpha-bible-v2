import { useCallback, useEffect, useState } from "react";
import { AUTH_CONTEXT_EVENT } from "@/features/auth";
import { saveMemberProfile } from "./post-registrations";
import {
  fetchMemberChurchRecord,
  getCachedMemberChurch,
  type MemberChurchRecord,
} from "./member-church-api";

export function useMemberChurch() {
  const [church, setChurch] = useState<MemberChurchRecord | null>(() => getCachedMemberChurch());
  const [loading, setLoading] = useState(() => !getCachedMemberChurch());

  const refresh = useCallback(async () => {
    const hadCache = getCachedMemberChurch() != null;
    if (!hadCache) setLoading(true);
    try {
      const next = await fetchMemberChurchRecord();
      setChurch(next);
      if (next?.name) {
        saveMemberProfile({ churchName: next.name });
      }
    } catch (e) {
      console.error("[useMemberChurch]", e);
      setChurch(getCachedMemberChurch());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onHub = () => void refresh();
    const onAuth = () => void refresh();
    window.addEventListener("ab:church-hub", onHub);
    window.addEventListener("storage", onHub);
    window.addEventListener(AUTH_CONTEXT_EVENT, onAuth);
    return () => {
      window.removeEventListener("ab:church-hub", onHub);
      window.removeEventListener("storage", onHub);
      window.removeEventListener(AUTH_CONTEXT_EVENT, onAuth);
    };
  }, [refresh]);

  return { church, loading, refresh };
}
