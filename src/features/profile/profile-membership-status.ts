import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_CONTEXT_EVENT, getAuthUserId } from "@/features/auth";
import { useMemberChurch } from "@/features/church/use-member-church";

/** Profile affiliation — distinct from admin team status. */
export type ProfileAffiliationStatus = "approved" | "pending" | "none";

export const AFFILIATION_LABEL: Record<ProfileAffiliationStatus, string> = {
  approved: "عضو كنيسة",
  pending: "طلب قيد المراجعة",
  none: "غير منتسب",
};

export async function fetchProfileAffiliationStatus(): Promise<ProfileAffiliationStatus> {
  const uid = await getAuthUserId();
  if (!uid) return "none";

  const { data, error } = await supabase
    .from("church_memberships")
    .select("status")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data?.length) return "none";

  if (data.some((r) => r.status === "active")) return "approved";
  if (data.some((r) => r.status === "pending")) return "pending";
  return "none";
}

export function useProfileAffiliationStatus() {
  const { church, loading: churchLoading } = useMemberChurch();
  const [status, setStatus] = useState<ProfileAffiliationStatus>("none");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchProfileAffiliationStatus();
      setStatus(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onAuth = () => void refresh();
    window.addEventListener(AUTH_CONTEXT_EVENT, onAuth);
    window.addEventListener("ab:church-hub", onAuth);
    return () => {
      window.removeEventListener(AUTH_CONTEXT_EVENT, onAuth);
      window.removeEventListener("ab:church-hub", onAuth);
    };
  }, [refresh]);

  const isApproved = status === "approved" && Boolean(church?.id);

  return {
    status,
    loading: loading || churchLoading,
    isApproved,
    label: AFFILIATION_LABEL[status],
    refresh,
  };
}
