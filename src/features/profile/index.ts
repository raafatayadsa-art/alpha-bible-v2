export {
  isProfileCompleted,
  isUsernameAvailable,
  claimUsername,
  fetchUserProfile,
  sanitizeUsernameInput,
  validateUsernameFormat,
  buildUsernameSuggestions,
  profileCompletionQueryKey,
  userProfileQueryKey,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
  type UserProfile,
} from "./profile-api";
export { useUserProfile } from "./use-user-profile";
export { GuardedOutlet } from "./ProfileOnboardingGuard";
