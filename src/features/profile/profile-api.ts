import { supabase } from "@/integrations/supabase/client";

/**
 * Client integration for the existing (production-ready) Alpha Identity backend.
 *
 * Backend objects are owned by the database and MUST NOT be modified here:
 *   - public.is_profile_completed()                       -> boolean
 *   - public.is_username_available(username_to_check text) -> boolean
 *   - public.claim_username(new_username text, new_display_name text) -> void
 *   - public.user_profiles (row created by the on_auth_user_created trigger)
 *
 * Profile completion is ALWAYS resolved from the backend RPC — never cached in
 * localStorage / any persistent client storage.
 */

export const USERNAME_MIN_LENGTH = 4;
export const USERNAME_MAX_LENGTH = 20;
/** lowercase letters, numbers, underscore and dot only. */
export const USERNAME_PATTERN = /^[a-z0-9_.]+$/;

export type UserProfile = {
  userId: string;
  username: string | null;
  displayName: string | null;
};

/** Backend single source of truth for "can this user enter the app?". */
export async function isProfileCompleted(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_profile_completed");
  if (error) throw error;
  return data === true;
}

/** Backend availability check (case-insensitive, validated against all profiles). */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_username_available", {
    username_to_check: username,
  });
  if (error) throw error;
  return data === true;
}

/** Permanently claim the username + display name for the authenticated user. */
export async function claimUsername(username: string, displayName: string): Promise<void> {
  const { error } = await supabase.rpc("claim_username", {
    new_username: username,
    new_display_name: displayName,
  });
  if (error) throw error;
}

/** Reload the user_profiles row straight from the backend. */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, username, display_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    userId: data.user_id as string,
    username: (data.username as string | null) ?? null,
    displayName: (data.display_name as string | null) ?? null,
  };
}

/** Normalise raw input so the field only ever holds a valid username body. */
export function sanitizeUsernameInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, USERNAME_MAX_LENGTH);
}

/**
 * Returns an Arabic validation message when the username fails the format rules,
 * or null when the format is acceptable. (Availability is checked separately.)
 */
export function validateUsernameFormat(username: string): string | null {
  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return `اسم المستخدم يجب أن يكون بين ${USERNAME_MIN_LENGTH} و${USERNAME_MAX_LENGTH} حرفًا.`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return "يُسمح بالأحرف الصغيرة والأرقام والشرطة السفلية والنقطة فقط.";
  }
  return null;
}

/**
 * Build candidate usernames derived from a base. Each candidate is guaranteed to
 * satisfy the format rules; availability MUST still be verified via the backend
 * RPC before any candidate is shown to the user.
 */
export function buildUsernameSuggestions(base: string): string[] {
  const clean = sanitizeUsernameInput(base) || "alpha";
  const short = clean.slice(0, USERNAME_MAX_LENGTH - 6) || clean;
  const rand = Math.floor(10 + Math.random() * 89);
  const candidates = [
    `${clean}_1`,
    `${short}${rand}`,
    `${short}.eg`,
    `${short}_alpha`,
    `real${short}`,
    `${short}_${rand}`,
    `the${short}`,
  ];
  return Array.from(new Set(candidates)).filter(
    (candidate) =>
      candidate !== clean &&
      candidate.length >= USERNAME_MIN_LENGTH &&
      candidate.length <= USERNAME_MAX_LENGTH &&
      USERNAME_PATTERN.test(candidate),
  );
}

/** Stable query key for the backend profile-completion check (per user). */
export function profileCompletionQueryKey(userId: string | null) {
  return ["profile", "completion", userId] as const;
}

/** Stable query key for the user_profiles record (per user). */
export function userProfileQueryKey(userId: string | null) {
  return ["profile", "record", userId] as const;
}
