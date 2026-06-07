import { supabase } from "@/integrations/supabase/client";

/** Canonical app roles — priority: owner > priest > servant > member > guest */
export type AlphaRole = "owner" | "priest" | "servant" | "member" | "guest";

export type AlphaRoleContext = {
  role: AlphaRole;
  isPlatformOwner: boolean;
  churchId: string | null;
};

const EMPTY: AlphaRoleContext = {
  role: "guest",
  isPlatformOwner: false,
  churchId: null,
};

export async function isPlatformOwnerUser(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("platform_owners")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("isPlatformOwnerUser", error);
    return false;
  }
  return !!data;
}

async function resolveChurchLeadershipRole(
  userId: string,
): Promise<"priest" | "servant" | null> {
  const { data: roles, error } = await supabase
    .from("church_roles")
    .select("role_type")
    .eq("user_id", userId);

  if (error || !roles?.length) return null;

  if (roles.some((r) => r.role_type === "priest")) return "priest";
  if (roles.some((r) => r.role_type === "servant" || r.role_type === "admin")) return "servant";
  return null;
}

async function resolveActiveMembership(userId: string): Promise<string | null> {
  const { data: membership, error } = await supabase
    .from("church_memberships")
    .select("church_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error || !membership?.church_id) return null;

  const churchId = String(membership.church_id);
  const { data: church } = await supabase
    .from("churches")
    .select("id")
    .eq("id", churchId)
    .eq("status", "approved")
    .maybeSingle();

  return church?.id != null ? String(church.id) : null;
}

export async function resolveAlphaRoleContext(userId: string | null): Promise<AlphaRoleContext> {
  if (!userId) return EMPTY;

  const isPlatformOwner = await isPlatformOwnerUser(userId);
  if (isPlatformOwner) {
    const churchId = await resolveActiveMembership(userId);
    return { role: "owner", isPlatformOwner: true, churchId };
  }

  const leadership = await resolveChurchLeadershipRole(userId);
  if (leadership === "priest") {
    const churchId = await resolveActiveMembership(userId);
    return { role: "priest", isPlatformOwner: false, churchId };
  }
  if (leadership === "servant") {
    const churchId = await resolveActiveMembership(userId);
    return { role: "servant", isPlatformOwner: false, churchId };
  }

  const churchId = await resolveActiveMembership(userId);
  if (churchId) {
    return { role: "member", isPlatformOwner: false, churchId };
  }

  return { role: "guest", isPlatformOwner: false, churchId: null };
}

/** Map Alpha role → church post-store role (no mock). */
export function alphaRoleToChurchRole(role: AlphaRole): "priest" | "servant" | "admin" | "member" {
  switch (role) {
    case "owner":
      return "admin";
    case "priest":
      return "priest";
    case "servant":
      return "servant";
    case "member":
    case "guest":
    default:
      return "member";
  }
}

export function canManageChurchPosts(role: AlphaRole): boolean {
  return role === "owner" || role === "priest" || role === "servant";
}
