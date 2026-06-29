import { clearFamilyProfileStorage } from "@/features/church/trip-reservations/family-booking";
import { clearProfilePeopleLinks } from "./profile-people-store";
import { DEFAULT_PROFILE_USER, saveProfileUserState } from "./profile-user-store";

export const PROFILE_REGISTRY_RESET_VERSION = "2026-06-27-profile-registry-v1";

const PUBLISHER_REPOSTS_KEY = "alpha:profile:publisher-reposts";
const CONTENT_REPOSTS_KEY = "alpha:profile:content-reposts";
const REGISTRY_VERSION_KEY = "ab:profile-registry-version";

/** Wipe all local profile people / family registry data on this device. */
export function clearProfileRegistryLocal(): void {
  if (typeof window === "undefined") return;

  clearProfilePeopleLinks();
  clearFamilyProfileStorage();

  for (const key of [PUBLISHER_REPOSTS_KEY, CONTENT_REPOSTS_KEY]) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  saveProfileUserState({
    ...DEFAULT_PROFILE_USER,
    customAvatarUrl: null,
    bio: "",
    birthDate: null,
  });

  window.dispatchEvent(new CustomEvent("ab:profile-user", { detail: DEFAULT_PROFILE_USER }));
}

/** One-time reset so every device starts with an empty people registry. */
export function ensureProfileRegistryReset(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(REGISTRY_VERSION_KEY) === PROFILE_REGISTRY_RESET_VERSION) return;
    clearProfileRegistryLocal();
    localStorage.setItem(REGISTRY_VERSION_KEY, PROFILE_REGISTRY_RESET_VERSION);
  } catch {
    /* ignore */
  }
}

export { clearProfileRegistryLocal as resetProfileRegistry };
