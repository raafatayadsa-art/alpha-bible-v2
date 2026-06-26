import { supabase } from "@/integrations/supabase/client";
import type { ChurchPageStatus } from "./page-status";

export type ChurchClaimStatus = {
  pageStatus: ChurchPageStatus;
  hasPendingClaim: boolean;
  userHasPendingClaim: boolean;
};

export type SubmitChurchClaimResult =
  | { ok: true; pageStatus: ChurchPageStatus }
  | { ok: false; reason: string; message: string };

export async function fetchChurchClaimStatus(churchId: string): Promise<ChurchClaimStatus | null> {
  const { data, error } = await supabase.rpc("get_church_claim_status", {
    p_church_id: Number(churchId),
  });

  if (error) {
    console.warn("[fetchChurchClaimStatus]", error.message);
    return null;
  }

  const payload = data as {
    pageStatus?: ChurchPageStatus;
    hasPendingClaim?: boolean;
    userHasPendingClaim?: boolean;
  } | null;

  if (!payload?.pageStatus) return null;

  return {
    pageStatus: payload.pageStatus,
    hasPendingClaim: Boolean(payload.hasPendingClaim),
    userHasPendingClaim: Boolean(payload.userHasPendingClaim),
  };
}

export async function submitChurchClaim(
  churchId: string,
  note?: string,
): Promise<SubmitChurchClaimResult> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) {
    return {
      ok: false,
      reason: "not_authenticated",
      message: "سجّل دخولك أولاً لطلب إدارة الكنيسة.",
    };
  }

  const { data, error } = await supabase.rpc("submit_church_claim", {
    p_church_id: Number(churchId),
    p_note: note?.trim() || null,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("not_authenticated")) {
      return { ok: false, reason: "not_authenticated", message: "سجّل دخولك أولاً." };
    }
    if (msg.includes("already_verified")) {
      return { ok: false, reason: "already_verified", message: "هذه الكنيسة موثّقة بالفعل." };
    }
    if (msg.includes("claim_pending")) {
      return { ok: false, reason: "claim_pending", message: "يوجد طلب استلام قيد المراجعة." };
    }
    if (msg.includes("church_not_found")) {
      return { ok: false, reason: "church_not_found", message: "لم نجد هذه الكنيسة." };
    }
    console.error("[submitChurchClaim]", error);
    return { ok: false, reason: "error", message: "تعذّر إرسال الطلب. حاول مرة أخرى." };
  }

  const payload = data as { pageStatus?: ChurchPageStatus } | null;
  return { ok: true, pageStatus: payload?.pageStatus ?? "pending_claim" };
}
