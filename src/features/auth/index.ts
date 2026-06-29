export type { AlphaAuthUser } from "./alpha-auth";
export { fetchAuthUser, fetchAuthSession, AVATAR_FALLBACK } from "./alpha-auth";
export type { AlphaRole, AlphaRoleContext } from "./alpha-roles";
export {
  resolveAlphaRoleContext,
  isPlatformOwnerUser,
  alphaRoleToChurchRole,
  canManageChurchPosts,
  roleLabelFromContext,
  isFounderEmail,
  FOUNDER_EMAIL,
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
  getChurchShieldRoleSync,
  getDisplayShieldRoleSync,
  getRoleLabelSync,
  subscribeAuthContext,
  AUTH_CONTEXT_EVENT,
} from "./auth-context";
export { ProfileCompletionGate } from "./profile-completion-gate";
export {
  checkProfileCompleted,
  checkUsernameAvailable,
  claimUsername,
  ensureUserProfileRow,
  fetchUserProfileRow,
  isProfileGatePublicPath,
  isPremiumAuthExperience,
  resolvePostAuthPath,
  normalizeUsernameInput,
  validateUsernameFormat,
} from "./profile-completion-api";

/** Authenticated Supabase user id — null when signed out (no guest fallback). */
export async function getAuthUserId(): Promise<string | null> {
  const { fetchAuthUser } = await import("./alpha-auth");
  const user = await fetchAuthUser();
  return user?.id ?? null;
}

/** Wait for Supabase Auth session (e.g. right after AuthBootstrap on first paint). */
export async function waitForAuthUserId(maxWaitMs = 4000): Promise<string | null> {
  const existing = await getAuthUserId();
  if (existing) return existing;

  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const userId = await getAuthUserId();
    if (userId) return userId;
  }
  return null;
}

export { devSignIn, devSignUp, devSignOut } from "./dev-auth";
export type { DevAuthResult } from "./dev-auth";
export { signOutCurrentDevice, signOutAllDevices } from "./sign-out";
export { clearGuestMode, continueAsGuest, enterGuestMode, isGuestModeActive, ensureGuestSessionHygiene } from "./guest-mode";
export {
  LOGIN_REQUIRED_AR,
  canUsePersonalFeaturesSync,
  isLoggedInSync,
  useCanUsePersonalFeatures,
} from "./auth-capabilities";
export {
  clearUserScopedLocalData,
  handleAuthUserTransition,
  readLastBoundAuthUserId,
  writeLastBoundAuthUserId,
  LAST_BOUND_AUTH_USER_KEY,
} from "./user-data-isolation";
