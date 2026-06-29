import { supabase } from "@/integrations/supabase/client";
import { deriveAlphaIdShort } from "@/features/identity/alpha-identity";
import { normalizeAlphaMemberCode } from "@/features/publisher/components/AlphaMemberScanSheet";

export type AlphaIdentityLookup = {
  userId: string;
  alphaId: string;
  alphaIdShort: string;
  displayName: string;
  avatarUrl?: string;
};

/** Resolve a scanned or typed Alpha ID to a real user via alpha_identities + user_profiles. */
export async function lookupUserByAlphaCode(raw: string): Promise<AlphaIdentityLookup | null> {
  const code = normalizeAlphaMemberCode(raw);
  if (!code) return null;

  const { data: identity, error } = await supabase
    .from("alpha_identities")
    .select("user_id, alpha_id, alpha_id_short")
    .or(`alpha_id.eq.${code},alpha_id_short.eq.${code}`)
    .maybeSingle();

  if (error) {
    console.error("[alpha-identity-lookup]", error.message);
    return null;
  }
  if (!identity?.user_id) return null;

  const userId = String(identity.user_id);
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, avatar_url")
    .eq("user_id", userId)
    .maybeSingle();

  const displayName = String(profile?.display_name ?? "").trim() || "عضو Alpha";
  const avatarUrl = profile?.avatar_url ? String(profile.avatar_url) : undefined;

  return {
    userId,
    alphaId: String(identity.alpha_id ?? code),
    alphaIdShort: String(identity.alpha_id_short ?? deriveAlphaIdShort(userId)),
    displayName,
    avatarUrl,
  };
}
