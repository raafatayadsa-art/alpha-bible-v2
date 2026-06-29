import { supabase } from "@/integrations/supabase/client";
import type { ShieldRole } from "@/components/alpha/AlphaShield";

/** Canonical app roles — priority: owner > priest > servant > member > guest */
export type AlphaRole = "owner" | "priest" | "servant" | "member" | "guest";

export type AdminTeamRole = "super_admin" | "admin";

/** App founder email — bootstrapped in platform_owners via SQL. */
export const FOUNDER_EMAIL = "alpha.coptic@proton.me";

export type AlphaRoleContext = {
  role: AlphaRole;
  isPlatformOwner: boolean;
  churchId: string | null;
  /** Shield from approved church membership only. */
  churchShieldRole: ShieldRole | null;
  /** Alpha official shield for founder / admin team (no church required). */
  platformShieldRole: ShieldRole | null;
  /** What the UI should render — platform shield wins over church. */
  displayShieldRole: ShieldRole | null;
  /** e.g. المؤسس — shown under display name. */
  platformOwnerLabel: string | null;
  adminTeamRole: AdminTeamRole | null;
};

const EMPTY: AlphaRoleContext = {
  role: "guest",
  isPlatformOwner: false,
  churchId: null,
  churchShieldRole: null,
  platformShieldRole: null,
  displayShieldRole: null,
  platformOwnerLabel: null,
  adminTeamRole: null,
};

export function isFounderEmail(email: string | null | undefined): boolean {
  return !!email && email.trim().toLowerCase() === FOUNDER_EMAIL.toLowerCase();
}

async function fetchOwnerProfileRpc(): Promise<{ is_owner: boolean; label?: string | null }> {
  const { data, error } = await supabase.rpc("platform_my_owner_profile");
  if (error || !data || typeof data !== "object") return { is_owner: false };
  const row = data as { is_owner?: boolean; label?: string | null };
  return { is_owner: row.is_owner === true, label: row.label ?? null };
}

async function resolveAdminTeamRole(): Promise<AdminTeamRole | null> {
  const { data, error } = await supabase.rpc("admin_fetch_my_team_role");
  if (error) {
    if (!error.message.includes("Could not find the function")) {
      console.warn("[admin_fetch_my_team_role]", error.message);
    }
    return null;
  }
  if (data === "super_admin" || data === "admin") return data;
  return null;
}

function mergeShield(platform: ShieldRole | null, church: ShieldRole | null): ShieldRole | null {
  return platform ?? church;
}

export async function isPlatformOwnerUser(
  userId: string,
  email?: string | null,
): Promise<boolean> {
  if (!isFounderEmail(email)) return false;

  const { data: rpcData, error: rpcError } = await supabase.rpc("is_platform_owner", {
    p_user: userId,
  });
  if (!rpcError && rpcData === true) return true;
  if (rpcError && !rpcError.message.includes("Could not find the function")) {
    console.warn("[is_platform_owner]", rpcError.message);
  }

  const { data, error } = await supabase
    .from("platform_owners")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[platform_owners]", error.message);
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

/** Church-verified shield — independent of platform owner / login-only users. */
export async function resolveChurchShieldRole(userId: string): Promise<ShieldRole | null> {
  const leadership = await resolveChurchLeadershipRole(userId);
  if (leadership === "priest") return "priest";
  if (leadership === "servant") return "servant";
  const churchId = await resolveActiveMembership(userId);
  if (churchId) return "member";
  return null;
}

export async function resolveAlphaRoleContext(
  userId: string | null,
  email?: string | null,
): Promise<AlphaRoleContext> {
  if (!userId) return EMPTY;

  const founderByEmail = isFounderEmail(email);
  let isPlatformOwner = false;
  let platformOwnerLabel: string | null = null;

  if (founderByEmail) {
    isPlatformOwner = await isPlatformOwnerUser(userId, email);
    if (isPlatformOwner) {
      const ownerProfile = await fetchOwnerProfileRpc();
      platformOwnerLabel = ownerProfile.label?.trim() || "المؤسس";
    }
  }

  const adminTeamRole = await resolveAdminTeamRole();
  const platformShieldRole: ShieldRole | null =
    isPlatformOwner || adminTeamRole ? "official" : null;
  const churchShieldRole = await resolveChurchShieldRole(userId);
  const displayShieldRole = mergeShield(platformShieldRole, churchShieldRole);

  if (isPlatformOwner) {
    const churchId = await resolveActiveMembership(userId);
    return {
      role: "owner",
      isPlatformOwner: true,
      churchId,
      churchShieldRole,
      platformShieldRole,
      displayShieldRole,
      platformOwnerLabel,
      adminTeamRole,
    };
  }

  if (adminTeamRole) {
    const churchId = await resolveActiveMembership(userId);
    const leadership = await resolveChurchLeadershipRole(userId);
    const role: AlphaRole = leadership ?? (churchId ? "member" : "guest");
    return {
      role,
      isPlatformOwner: false,
      churchId,
      churchShieldRole,
      platformShieldRole,
      displayShieldRole,
      platformOwnerLabel: null,
      adminTeamRole,
    };
  }

  const leadership = await resolveChurchLeadershipRole(userId);
  if (leadership === "priest") {
    const churchId = await resolveActiveMembership(userId);
    return {
      role: "priest",
      isPlatformOwner: false,
      churchId,
      churchShieldRole,
      platformShieldRole: null,
      displayShieldRole,
      platformOwnerLabel: null,
      adminTeamRole: null,
    };
  }
  if (leadership === "servant") {
    const churchId = await resolveActiveMembership(userId);
    return {
      role: "servant",
      isPlatformOwner: false,
      churchId,
      churchShieldRole,
      platformShieldRole: null,
      displayShieldRole,
      platformOwnerLabel: null,
      adminTeamRole: null,
    };
  }

  const churchId = await resolveActiveMembership(userId);
  if (churchId) {
    return {
      role: "member",
      isPlatformOwner: false,
      churchId,
      churchShieldRole,
      platformShieldRole: null,
      displayShieldRole,
      platformOwnerLabel: null,
      adminTeamRole: null,
    };
  }

  return {
    role: "guest",
    isPlatformOwner: false,
    churchId: null,
    churchShieldRole,
    platformShieldRole: null,
    displayShieldRole,
    platformOwnerLabel: null,
    adminTeamRole: null,
  };
}

/** Profile / UI label under display name. */
export function roleLabelFromContext(ctx: AlphaRoleContext, email?: string | null): string {
  if (ctx.platformOwnerLabel?.trim()) return ctx.platformOwnerLabel.trim();
  if (ctx.adminTeamRole === "super_admin") return "مسؤول أعلى";
  if (ctx.adminTeamRole === "admin") return "مسؤول";
  switch (ctx.role) {
    case "owner":
      return isFounderEmail(email) ? "المؤسس" : "مالك المنصة";
    case "priest":
      return "كاهن";
    case "servant":
      return "خادم";
    case "member":
      return "عضو عادي";
    default:
      return "زائر";
  }
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
