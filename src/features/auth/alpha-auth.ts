import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfileRow, type UserProfileRow } from "./profile-completion-api";

export type AlphaAuthUser = {
  id: string;
  email: string | null;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
};

const AVATAR_FALLBACK = "https://i.pravatar.cc/80?u=alpha-user";

function resolveDisplayName(meta: Record<string, unknown>, profileDisplayName?: string | null): string {
  const fromMeta =
    (typeof meta.display_name === "string" && meta.display_name.trim()) ||
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "";
  if (fromMeta) return fromMeta;
  if (profileDisplayName?.trim()) return profileDisplayName.trim();
  return "مستخدم Alpha";
}

function mapUser(
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
  profile?: UserProfileRow | null,
): AlphaAuthUser {
  const meta = user.user_metadata ?? {};
  const avatarUrl =
    profile?.avatar_url ||
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;
  return {
    id: user.id,
    email: user.email ?? null,
    displayName: resolveDisplayName(meta, profile?.display_name),
    username: profile?.username ?? null,
    avatarUrl: avatarUrl ?? AVATAR_FALLBACK,
  };
}

/** Load session from Supabase Auth (persisted). Uses local session first for mobile. */
export async function fetchAuthUser(): Promise<AlphaAuthUser | null> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) return null;

    const sessionUser = sessionData.session.user;
    let profile: UserProfileRow | null = null;
    try {
      profile = await fetchUserProfileRow(sessionUser.id);
    } catch {
      /* profile row optional for first paint */
    }
    return mapUser(sessionUser, profile);
  } catch {
    return null;
  }
}

export async function fetchAuthSession() {
  try {
    return await supabase.auth.getSession();
  } catch {
    return { data: { session: null }, error: null };
  }
}

export { mapUser, AVATAR_FALLBACK };
