import { supabase } from "@/integrations/supabase/client";

export type JoinChurchResult =
  | { ok: true; churchId: string }
  | {
      ok: false;
      reason: "not_authenticated" | "already_member" | "church_not_found" | "error";
      message: string;
    };

const PENDING_JOIN_KEY = "ab:pending-church-join";

export function savePendingChurchJoin(churchId: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_JOIN_KEY, churchId);
  } catch {
    /* ignore */
  }
}

export function readPendingChurchJoin(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(PENDING_JOIN_KEY);
  } catch {
    return null;
  }
}

export function clearPendingChurchJoin() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_JOIN_KEY);
  } catch {
    /* ignore */
  }
}

export async function getActiveMembershipChurchIds(): Promise<string[]> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) return [];

  const { data: memberships, error } = await supabase
    .from("church_memberships")
    .select("church_id")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error || !memberships?.length) return [];

  const ids = [...new Set(memberships.map((m) => String(m.church_id)).filter(Boolean))];
  if (!ids.length) return [];

  const { data: churches } = await supabase
    .from("churches")
    .select("id")
    .in("id", ids)
    .eq("is_active", true);

  const active = new Set((churches ?? []).map((c) => String(c.id)));
  return ids.filter((id) => active.has(id));
}

/** Primary church — first active membership (backward compatible). */
export async function getActiveMembershipChurchId(): Promise<string | null> {
  const ids = await getActiveMembershipChurchIds();
  return ids[0] ?? null;
}

export async function isMemberOfChurch(churchId: string): Promise<boolean> {
  const ids = await getActiveMembershipChurchIds();
  return ids.includes(churchId);
}

export async function joinChurch(churchId: string): Promise<JoinChurchResult> {
  const { waitForAuthUserId, refreshAuthContext } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) {
    return {
      ok: false,
      reason: "not_authenticated",
      message: "سجّل دخولك أولاً للانضمام إلى الكنيسة.",
    };
  }

  const { data: church, error: churchError } = await supabase
    .from("churches")
    .select("id")
    .eq("id", churchId)
    .eq("is_active", true)
    .maybeSingle();

  if (churchError || !church?.id) {
    console.error("[joinChurch] church lookup failed", churchError);
    return {
      ok: false,
      reason: "church_not_found",
      message: "لم نجد هذه الكنيسة في الدليل المعتمد.",
    };
  }

  const resolvedId = String(church.id);

  const { data: existing, error: existingError } = await supabase
    .from("church_memberships")
    .select("id, church_id, status")
    .eq("user_id", userId)
    .eq("church_id", resolvedId)
    .maybeSingle();

  if (existingError) {
    console.error("[joinChurch] membership lookup failed", existingError);
    return {
      ok: false,
      reason: "error",
      message: "تعذّر التحقق من عضويتك. حاول مرة أخرى.",
    };
  }

  if (existing?.status === "active") {
    clearPendingChurchJoin();
    return { ok: true, churchId: resolvedId };
  }

  const membershipRow = {
    church_id: resolvedId,
    user_id: userId,
    status: "active" as const,
    role_label: "عضو",
    platform_role: "member" as const,
    updated_at: new Date().toISOString(),
  };

  const mutation = existing?.id
    ? supabase.from("church_memberships").update(membershipRow).eq("id", existing.id)
    : supabase.from("church_memberships").insert(membershipRow);

  const { error: saveError } = await mutation;
  if (saveError) {
    console.error("[joinChurch] save failed", saveError);
    return {
      ok: false,
      reason: "error",
      message: "تعذّر إتمام الانضمام. حاول مرة أخرى.",
    };
  }

  clearPendingChurchJoin();
  await refreshAuthContext();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ab:church-hub"));
  }

  return { ok: true, churchId: resolvedId };
}

/** After login — complete a saved join intent if present. */
export async function completePendingChurchJoin(): Promise<string | null> {
  const pendingId = readPendingChurchJoin();
  if (!pendingId) return null;

  const result = await joinChurch(pendingId);
  if (result.ok) return result.churchId;
  clearPendingChurchJoin();
  return null;
}
