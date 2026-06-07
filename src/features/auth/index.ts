export type { AlphaAuthUser } from "./alpha-auth";
export { fetchAuthUser, fetchAuthSession, AVATAR_FALLBACK } from "./alpha-auth";
export type { AlphaRole, AlphaRoleContext } from "./alpha-roles";
export {
  resolveAlphaRoleContext,
  isPlatformOwnerUser,
  alphaRoleToChurchRole,
  canManageChurchPosts,
} from "./alpha-roles";
export {
  AuthBootstrap,
  useAlphaAuth,
  initAuth,
  refreshAuthContext,
  getAuthUserSync,
  getAlphaRoleSync,
  getAlphaRoleContextSync,
  isPlatformOwnerSync,
  subscribeAuthContext,
  AUTH_CONTEXT_EVENT,
} from "./auth-context";

/** Authenticated Supabase user id — null when signed out (no guest fallback). */
export async function getAuthUserId(): Promise<string | null> {
  const { fetchAuthUser } = await import("./alpha-auth");
  const user = await fetchAuthUser();
  return user?.id ?? null;
}
