import { useCallback, useEffect, useState } from "react";
import { readSettingsState } from "@/features/settings/settings-store";
import {
  DEFAULT_FIELD_PRIVACY,
  type ProfileFieldPrivacy,
  type ProfileVisibility,
} from "./profile-privacy";

const STORAGE_KEY = "ab:profile-user";
const STORAGE_VERSION = 3;

export type { ProfileVisibility, ProfileFieldPrivacy };

export type ProfileUserState = {
  version: number;
  bio: string;
  birthDate: string | null;
  customAvatarUrl: string | null;
  hidePhone: boolean;
  privacy: ProfileFieldPrivacy;
};

export const DEFAULT_PROFILE_USER: ProfileUserState = {
  version: STORAGE_VERSION,
  bio: "",
  birthDate: null,
  customAvatarUrl: null,
  hidePhone: false,
  privacy: { ...DEFAULT_FIELD_PRIVACY },
};

type LegacyVisibility = "everyone" | "church" | "friends";

function boolToVisibility(show: boolean, fallback: ProfileVisibility): ProfileVisibility {
  return show ? fallback : "hidden";
}

function migrateRaw(parsed: Record<string, unknown>): ProfileUserState {
  const base: ProfileUserState = {
    ...DEFAULT_PROFILE_USER,
    ...parsed,
    privacy: { ...DEFAULT_FIELD_PRIVACY },
  };

  if (
    (parsed.version === STORAGE_VERSION || parsed.version === 2) &&
    parsed.privacy &&
    typeof parsed.privacy === "object"
  ) {
    return {
      ...base,
      customAvatarUrl: typeof parsed.customAvatarUrl === "string" ? parsed.customAvatarUrl : null,
      hidePhone: typeof parsed.hidePhone === "boolean" ? parsed.hidePhone : base.hidePhone,
      privacy: { ...DEFAULT_FIELD_PRIVACY, ...(parsed.privacy as ProfileFieldPrivacy) },
    };
  }

  const legacyVisibility = (parsed.profileVisibility as LegacyVisibility | undefined) ?? "church";
  const pick = (showKey: string, defaultShow = true): ProfileVisibility => {
    if (typeof parsed[showKey] === "boolean") {
      return boolToVisibility(parsed[showKey] as boolean, legacyVisibility);
    }
    return defaultShow ? legacyVisibility : "hidden";
  };

  try {
    const legacy = readSettingsState();
    const vis = legacy.profileVisibility ?? legacyVisibility;
    base.privacy = {
      avatar: pick("showAvatar"),
      bio: pick("showBio"),
      achievements: pick("showAchievements"),
      spiritualStats: pick("showSpiritualStats"),
      church: typeof parsed.showChurch === "boolean"
        ? boolToVisibility(parsed.showChurch as boolean, vis)
        : typeof legacy.hideChurch === "boolean"
          ? boolToVisibility(!legacy.hideChurch, vis)
          : vis,
      birthDate: typeof parsed.showBirthDate === "boolean"
        ? boolToVisibility(parsed.showBirthDate as boolean, "friends")
        : typeof legacy.hideBirthdate === "boolean"
          ? boolToVisibility(!legacy.hideBirthdate, "friends")
          : "hidden",
    };
    base.hidePhone = typeof parsed.hidePhone === "boolean" ? parsed.hidePhone as boolean : legacy.hidePhone;
  } catch {
    base.privacy = {
      avatar: pick("showAvatar"),
      bio: pick("showBio"),
      achievements: pick("showAchievements"),
      spiritualStats: pick("showSpiritualStats"),
      church: pick("showChurch"),
      birthDate: pick("showBirthDate", false),
    };
  }

  if (typeof parsed.bio === "string") base.bio = parsed.bio;
  if (typeof parsed.birthDate === "string" || parsed.birthDate === null) {
    base.birthDate = parsed.birthDate as string | null;
  }
  if (typeof parsed.customAvatarUrl === "string") {
    base.customAvatarUrl = parsed.customAvatarUrl;
  }

  base.version = STORAGE_VERSION;
  return base;
}

function read(): ProfileUserState {
  if (typeof window === "undefined") return DEFAULT_PROFILE_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE_USER;
    return migrateRaw(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return DEFAULT_PROFILE_USER;
  }
}

function write(state: ProfileUserState) {
  if (typeof window === "undefined") return;
  try {
    const payload = { ...state, version: STORAGE_VERSION };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("ab:profile-user", { detail: payload }));
    const pendingCrop = state.customAvatarUrl?.startsWith("data:");
    if (!pendingCrop) {
      void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
        scheduleUserDataSync({ delayMs: 2000, extraKey: STORAGE_KEY }),
      );
    }
  } catch { /* ignore */ }
}

export function readProfileUserState(): ProfileUserState {
  return read();
}

export function writeProfileUserState(partial: Partial<ProfileUserState>) {
  write({ ...read(), ...partial });
}

export function saveProfileUserState(state: ProfileUserState) {
  write({ ...state, version: STORAGE_VERSION });
}

const PLACEHOLDER_AVATAR_RE = /pravatar\.cc/i;

export function isPlaceholderAvatarUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  return PLACEHOLDER_AVATAR_RE.test(url);
}

/** After login — replace device-only avatar blob with cloud URL when available. */
export function syncLocalProfileAvatarFromCloud(cloudAvatarUrl: string | null | undefined) {
  const url = cloudAvatarUrl?.trim();
  if (!url || isPlaceholderAvatarUrl(url)) return;
  const state = read();
  const custom = state.customAvatarUrl?.trim();
  // Never clobber an in-progress crop (data URL) waiting for save/upload.
  if (custom?.startsWith("data:")) return;
  if (!custom || isPlaceholderAvatarUrl(custom)) {
    if (custom !== url) write({ ...state, customAvatarUrl: url });
  }
}

export function resolveProfileAvatar(
  customAvatarUrl: string | null,
  fallbackUrl: string,
): string {
  return customAvatarUrl?.trim() || fallbackUrl;
}

/** Real user photo — cloud/OAuth first; ignore stale device-only base64 when logged in. */
export function resolveProfileDisplayAvatar(
  customAvatarUrl: string | null,
  authAvatarUrl: string | null | undefined,
): string | null {
  const auth = authAvatarUrl?.trim();
  const authReal = auth && !isPlaceholderAvatarUrl(auth) ? auth : null;
  const custom = customAvatarUrl?.trim();
  const customIsDeviceOnly = custom?.startsWith("data:") ?? false;

  if (authReal && (!custom || customIsDeviceOnly)) return authReal;
  if (custom) return custom;
  if (authReal) return authReal;
  return null;
}

/** Unified avatar for profile surfaces (header + profile page). */
export function resolveAccountAvatar(
  customAvatarUrl: string | null,
  authAvatarUrl: string | null | undefined,
): string {
  return (
    resolveProfileDisplayAvatar(customAvatarUrl, authAvatarUrl) ??
    authAvatarUrl?.trim() ??
    ""
  );
}

export function profileAvatarInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  const single = parts[0] ?? "A";
  return single.slice(0, 2).toUpperCase();
}

export function useProfileUser() {
  const [state, setState] = useState<ProfileUserState>(() => read());

  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener("ab:profile-user", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ab:profile-user", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const patch = useCallback(<K extends keyof ProfileUserState>(key: K, value: ProfileUserState[K]) => {
    setState((prev) => {
      const next = { ...prev, [key]: value, version: STORAGE_VERSION };
      write(next);
      return next;
    });
  }, []);

  const patchPrivacy = useCallback(<K extends keyof ProfileFieldPrivacy>(
    key: K,
    value: ProfileFieldPrivacy[K],
  ) => {
    setState((prev) => {
      const next = {
        ...prev,
        version: STORAGE_VERSION,
        privacy: { ...prev.privacy, [key]: value },
      };
      write(next);
      return next;
    });
  }, []);

  const patchMany = useCallback((partial: Partial<ProfileUserState>) => {
    setState((prev) => {
      const next = {
        ...prev,
        ...partial,
        version: STORAGE_VERSION,
        privacy: partial.privacy ? { ...prev.privacy, ...partial.privacy } : prev.privacy,
      };
      write(next);
      return next;
    });
  }, []);

  const replace = useCallback((next: ProfileUserState) => {
    const saved = { ...next, version: STORAGE_VERSION };
    write(saved);
    setState(saved);
  }, []);

  return { state, patch, patchPrivacy, patchMany, replace };
}
