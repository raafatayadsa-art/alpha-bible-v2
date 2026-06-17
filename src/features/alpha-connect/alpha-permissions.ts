import { getAuthUserSync, getAlphaRoleContextSync, isPlatformOwnerSync } from "@/features/auth/auth-context";
import { getCurrentUser } from "@/features/church/current-user";

/** Review mode — grants owner capabilities to the active session only (never shown in UI). */
export const CONNECT_FORCE_ALPHA_OWNER = true;

/** Independent permission roles — separate from shield visuals. */
export type AlphaPermissionRole =
  | "alpha_owner"
  | "alpha_super_admin"
  | "alpha_admin"
  | "priest"
  | "servant"
  | "member"
  | "guest";

export type AlphaPermission =
  | "manage_channels"
  | "manage_churches"
  | "manage_users"
  | "manage_servants"
  | "manage_priests"
  | "review_reports"
  | "view_audit_logs"
  | "stealth_mode"
  | "system_settings";

const ALL_PERMISSIONS: AlphaPermission[] = [
  "manage_channels",
  "manage_churches",
  "manage_users",
  "manage_servants",
  "manage_priests",
  "review_reports",
  "view_audit_logs",
  "stealth_mode",
  "system_settings",
];

const ROLE_PERMISSIONS: Record<AlphaPermissionRole, readonly AlphaPermission[]> = {
  alpha_owner: ALL_PERMISSIONS,
  alpha_super_admin: [
    "manage_channels",
    "manage_users",
    "manage_servants",
    "manage_priests",
    "review_reports",
  ],
  alpha_admin: ["manage_channels", "review_reports"],
  priest: ["manage_servants"],
  servant: [],
  member: [],
  guest: [],
};

const ASSIGNED_ROLES_KEY = "ab.alpha-permission-roles.v1";

function viewerUserId(userId?: string): string {
  return userId || getCurrentViewerUserId();
}

export function getCurrentViewerUserId(): string {
  return getAuthUserSync()?.id || getCurrentUser().id || "creator";
}

function readAssignedRoles(): Record<string, AlphaPermissionRole> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ASSIGNED_ROLES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, AlphaPermissionRole>;
  } catch {
    return {};
  }
}

/** Platform owner — single account. Capabilities exist; never exposed in app UI. */
export function isAlphaOwner(userId?: string): boolean {
  const uid = viewerUserId(userId);
  const authUser = getAuthUserSync();
  const sessionOwnerId = authUser?.id || getCurrentUser().id || "creator";

  if (CONNECT_FORCE_ALPHA_OWNER) return uid === sessionOwnerId;
  if (authUser?.id !== uid) return false;
  return isPlatformOwnerSync();
}

export function resolveAlphaPermissionRole(userId?: string): AlphaPermissionRole {
  const uid = viewerUserId(userId);
  if (isAlphaOwner(uid)) return "alpha_owner";

  const assigned = readAssignedRoles()[uid];
  if (assigned === "alpha_super_admin" || assigned === "alpha_admin") return assigned;

  const authUser = getAuthUserSync();
  if (authUser?.id === uid) {
    const ctx = getAlphaRoleContextSync();
    if (ctx.role === "priest") return "priest";
    if (ctx.role === "servant") return "servant";
    if (ctx.role === "member") return "member";
    return "guest";
  }

  return "member";
}

export function hasAlphaPermission(userId: string, permission: AlphaPermission): boolean {
  const role = resolveAlphaPermissionRole(userId);
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Shield visuals only — never infer capabilities from this. */
export function hasOfficialTrustShield(userId: string): boolean {
  const role = resolveAlphaPermissionRole(userId);
  return role === "alpha_owner" || role === "alpha_super_admin" || role === "alpha_admin";
}

/** Owner capabilities must never appear in trust surfaces. */
export function canExposePermissionsInTrustUi(): boolean {
  return false;
}

/** Owner must not appear in in-app admin or leadership lists. */
export function shouldHideUserFromTrustLists(userId: string): boolean {
  return isAlphaOwner(userId);
}

export function assignAlphaPermissionRole(userId: string, role: AlphaPermissionRole): void {
  if (typeof window === "undefined") return;
  const next = readAssignedRoles();
  if (role === "alpha_owner") {
    delete next[userId];
  } else {
    next[userId] = role;
  }
  localStorage.setItem(ASSIGNED_ROLES_KEY, JSON.stringify(next));
}
