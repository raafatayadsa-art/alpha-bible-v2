import { supabase } from "@/integrations/supabase/client";
import { ADMIN_PERMISSION_KEYS, type AdminPermissionKey } from "./permissions";

export type AdminTeamMember = {
  id: string;
  auth_user_id: string | null;
  role_key: "super_admin" | "admin";
  status: "pending" | "active" | "disabled";
  full_name: string;
  username: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  login_count: number;
  last_login_at: string | null;
  last_activity_at: string | null;
  last_ip: string | null;
  created_at: string;
};

export type AdminInvitePreview = {
  ok: boolean;
  email?: string;
  full_name?: string;
  username?: string;
  role_key?: string;
};

export type AdminActivityRow = {
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  before_data: unknown;
  after_data: unknown;
  created_at: string;
};

function mapRpcError(message: string): string {
  if (message.includes("schema cache") || message.includes("admin_team_reset_permissions")) {
    return "شغّل RUN_ADMIN_TEAM_RESET_RPC.sql على Supabase ثم أعد المحاولة";
  }
  if (message.includes("forbidden")) return "ليس لديك صلاحية لهذه العملية";
  if (message.includes("email_exists")) return "البريد مسجّل مسبقاً";
  if (message.includes("invalid_invite")) return "رابط الدعوة غير صالح أو منتهي";
  if (message.includes("email_mismatch")) return "يجب التسجيل بنفس بريد الدعوة";
  if (message.includes("not_authenticated")) return "يجب تسجيل الدخول أولاً";
  if (message.includes("user_not_found")) return "المستخدم غير موجود على المنصة";
  return message;
}

function parsePermissionKeys(data: unknown): AdminPermissionKey[] {
  let raw: unknown[] = [];
  if (Array.isArray(data)) raw = data;
  else if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as unknown;
      if (Array.isArray(parsed)) raw = parsed;
    } catch {
      return [];
    }
  }
  const allowed = new Set<string>(ADMIN_PERMISSION_KEYS);
  return raw.filter((k): k is AdminPermissionKey => typeof k === "string" && allowed.has(k));
}

export async function fetchMyAdminPermissions(): Promise<AdminPermissionKey[]> {
  const { data, error } = await supabase.rpc("admin_fetch_my_permissions");
  if (error) {
    console.warn("[admin_fetch_my_permissions]", error.message);
    return [];
  }
  return parsePermissionKeys(data);
}

export async function adminHasPermission(key: AdminPermissionKey): Promise<boolean> {
  const { data, error } = await supabase.rpc("admin_has_permission", { p_key: key });
  if (error) return false;
  return data === true;
}

export async function fetchAdminTeamList(): Promise<AdminTeamMember[]> {
  const { data, error } = await supabase.rpc("admin_team_list");
  if (error) {
    console.warn("[admin_team_list]", error.message);
    return [];
  }
  if (!data || !Array.isArray(data)) return [];
  return enrichAdminTeamAvatars(data as AdminTeamMember[]);
}

export async function enrichAdminTeamAvatars(members: AdminTeamMember[]): Promise<AdminTeamMember[]> {
  const ids = members.map((m) => m.auth_user_id).filter(Boolean) as string[];
  if (!ids.length) {
    return members.map((m) => ({
      ...m,
      avatar_url: resolveTeamAvatarUrl(m),
    }));
  }

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, avatar_url, display_name, username")
    .in("user_id", ids);

  const byId = new Map((profiles ?? []).map((p) => [String(p.user_id), p]));

  return members.map((m) => {
    const profile = m.auth_user_id ? byId.get(m.auth_user_id) : undefined;
    return {
      ...m,
      full_name: m.full_name?.trim() || profile?.display_name?.trim() || m.full_name,
      username: m.username?.trim() || profile?.username?.trim() || m.username,
      avatar_url: resolveTeamAvatarUrl(m, profile?.avatar_url),
    };
  });
}

/** Real profile photo only — no placeholder avatars. */
export function resolveRealTeamAvatar(
  member: AdminTeamMember,
  profileAvatar?: string | null,
): string | null {
  const stored = member.avatar_url?.trim();
  if (stored && !stored.includes("pravatar.cc")) return stored;
  const fromProfile = profileAvatar?.trim();
  if (fromProfile) return fromProfile;
  return null;
}

function resolveTeamAvatarUrl(
  member: AdminTeamMember,
  profileAvatar?: string | null,
): string | null {
  return resolveRealTeamAvatar(member, profileAvatar);
}

/** Founder: add an existing platform friend as active admin (must have linkedUserId). */
export async function addFriendAsAdmin(input: {
  linkedUserId: string;
  roleKey?: "super_admin" | "admin";
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_team_add_friend_admin", {
    p_friend_user_id: input.linkedUserId,
    p_role_key: input.roleKey ?? "admin",
  });
  if (error) return { ok: false, error: mapRpcError(error.message) };
  return { ok: (data as { ok?: boolean })?.ok === true };
}

export async function fetchAdminTeamMember(id: string): Promise<{
  member: AdminTeamMember;
  activity: AdminActivityRow[];
} | null> {
  const { data, error } = await supabase.rpc("admin_team_get", { p_id: id });
  if (error || !data || typeof data !== "object") return null;
  const row = data as { member: AdminTeamMember; activity: AdminActivityRow[] };
  const [enriched] = await enrichAdminTeamAvatars([row.member]);
  return { member: enriched ?? row.member, activity: row.activity };
}

export async function inviteAdminTeamMember(input: {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  roleKey: "super_admin" | "admin";
}): Promise<{ ok: boolean; inviteToken?: string; inviteUrl?: string; error?: string }> {
  const { data, error } = await supabase.rpc("admin_team_invite", {
    p_full_name: input.fullName.trim(),
    p_username: input.username.trim(),
    p_email: input.email.trim().toLowerCase(),
    p_phone: input.phone?.trim() || null,
    p_avatar_url: input.avatarUrl?.trim() || null,
    p_role_key: input.roleKey,
  });

  if (error) return { ok: false, error: mapRpcError(error.message) };
  const row = data as { ok?: boolean; invite_token?: string; email?: string };
  if (!row?.ok || !row.invite_token) return { ok: false, error: "تعذّر إنشاء الدعوة" };

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = `${base}/invite/accept?token=${encodeURIComponent(row.invite_token)}`;

  return { ok: true, inviteToken: row.invite_token, inviteUrl };
}

export async function previewAdminInvite(token: string): Promise<AdminInvitePreview> {
  const { data, error } = await supabase.rpc("admin_invite_preview", { p_token: token });
  if (error || !data) return { ok: false };
  return data as AdminInvitePreview;
}

export async function acceptAdminInvite(token: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_accept_invite", { p_token: token });
  if (error) return { ok: false, error: mapRpcError(error.message) };
  return { ok: (data as { ok?: boolean })?.ok === true };
}

export async function setAdminTeamStatus(
  id: string,
  status: "active" | "disabled",
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_team_set_status", { p_id: id, p_status: status });
  if (error) return { ok: false, error: mapRpcError(error.message) };
  return { ok: (data as { ok?: boolean })?.ok === true };
}

export async function updateAdminTeamMember(
  id: string,
  patch: {
    fullName?: string;
    username?: string;
    phone?: string;
    avatarUrl?: string;
    roleKey?: "super_admin" | "admin";
  },
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_team_update", {
    p_id: id,
    p_full_name: patch.fullName ?? null,
    p_username: patch.username ?? null,
    p_phone: patch.phone ?? null,
    p_avatar_url: patch.avatarUrl ?? null,
    p_role_key: patch.roleKey ?? null,
  });
  if (error) return { ok: false, error: mapRpcError(error.message) };
  return { ok: (data as { ok?: boolean })?.ok === true };
}

export async function fetchAdminTeamPermissions(
  id: string,
): Promise<Record<string, boolean> | null> {
  const { data, error } = await supabase.rpc("admin_team_get_permissions", { p_id: id });
  if (error || !data || typeof data !== "object") return null;
  return data as Record<string, boolean>;
}

export async function saveAdminTeamPermissions(
  id: string,
  permissions: Record<string, boolean>,
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, boolean> = {};
  for (const key of ADMIN_PERMISSION_KEYS) {
    payload[key] = permissions[key] === true;
  }
  const { data, error } = await supabase.rpc("admin_team_set_permissions", {
    p_id: id,
    p_permissions: payload,
  });
  if (error) return { ok: false, error: mapRpcError(error.message) };
  return { ok: (data as { ok?: boolean })?.ok === true };
}

export async function resetAdminTeamPermissions(
  id: string,
): Promise<{ ok: boolean; error?: string; roleKey?: string }> {
  const { data, error } = await supabase.rpc("admin_team_reset_permissions", { p_id: id });
  if (error) return { ok: false, error: mapRpcError(error.message) };
  const row = data as { ok?: boolean; role_key?: string };
  return { ok: row?.ok === true, roleKey: row?.role_key };
}

export function roleLabelAr(role: string): string {
  if (role === "super_admin") return "مسؤول أعلى";
  if (role === "admin") return "مسؤول";
  return role;
}

export function statusLabelAr(status: string): string {
  if (status === "active") return "نشط";
  if (status === "disabled") return "معطّل";
  if (status === "pending") return "بانتظار التفعيل";
  return status;
}
