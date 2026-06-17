import { supabase } from "@/integrations/supabase/client";

export type AlphaAuthUser = {
  id: string;
  email: string | null;
  displayName: string;
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
  profileDisplayName?: string | null,
): AlphaAuthUser {
  const meta = user.user_metadata ?? {};
  const avatarUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;
  return {
    id: user.id,
    email: user.email ?? null,
    displayName: resolveDisplayName(meta, profileDisplayName),
    avatarUrl: avatarUrl ?? AVATAR_FALLBACK,
  };
}

async function fetchProfileDisplayName(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle();
    if (error || !data) return null;
    return typeof data.display_name === "string" ? data.display_name : null;
  } catch {
    return null;
  }
}

/** Load session from Supabase Auth (persisted). */
export async function fetchAuthUser(): Promise<AlphaAuthUser | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const profileDisplayName = await fetchProfileDisplayName(data.user.id);
    return mapUser(data.user, profileDisplayName);
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
