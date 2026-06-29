import { refreshAuthContext, isFounderEmail, getAuthUserSync } from "@/features/auth";
import { supabase } from "@/integrations/supabase/client";

export type OwnerProfile = {
  is_owner: boolean;
  label?: string | null;
  user_id?: string;
  email?: string | null;
};

/** Founder email only — claims owner row when table is empty. */
export async function tryClaimFirstPlatformOwner(): Promise<boolean> {
  if (!isFounderEmail(getAuthUserSync()?.email)) return false;

  const { data, error } = await supabase.rpc("platform_claim_first_owner");
  if (error) {
    if (!error.message.includes("Could not find the function")) {
      console.warn("[platform-owner] claim skipped", error.message);
    }
    return false;
  }

  const ok =
    data &&
    typeof data === "object" &&
    "ok" in data &&
    (data as { ok?: boolean }).ok === true;

  if (ok) {
    await refreshAuthContext();
  }
  return ok;
}

/** Security-definer check — works even when direct table SELECT is blocked. */
export async function checkIsPlatformOwnerRpc(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_platform_owner");
  if (error) {
    if (!error.message.includes("Could not find the function")) {
      console.warn("[is_platform_owner]", error.message);
    }
    return false;
  }
  return data === true;
}

export async function fetchMyOwnerProfile(): Promise<OwnerProfile> {
  const { data, error } = await supabase.rpc("platform_my_owner_profile");
  if (error || !data || typeof data !== "object") {
    return { is_owner: false };
  }
  return data as OwnerProfile;
}
