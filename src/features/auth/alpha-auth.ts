import { supabase } from "@/integrations/supabase/client";

export type AlphaAuthUser = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

const AVATAR_FALLBACK = "https://i.pravatar.cc/80?u=alpha-user";

function mapUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): AlphaAuthUser {
  const meta = user.user_metadata ?? {};
  const displayName =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    (user.email?.split("@")[0] ?? "مستخدم Alpha");
  const avatarUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;
  return {
    id: user.id,
    email: user.email ?? null,
    displayName,
    avatarUrl: avatarUrl ?? AVATAR_FALLBACK,
  };
}

/** Load session from Supabase Auth (persisted). */
export async function fetchAuthUser(): Promise<AlphaAuthUser | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return mapUser(data.user);
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
