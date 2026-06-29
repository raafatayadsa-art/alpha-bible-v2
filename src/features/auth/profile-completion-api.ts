import { supabase } from "@/integrations/supabase/client";

export const USERNAME_PATTERN = /^[a-z0-9._]{4,20}$/;

export function normalizeUsernameInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 20);
}

export function validateUsernameFormat(username: string): string | null {
  if (username.length < 4) return "يجب أن يكون اسم المستخدم 4 أحرف على الأقل.";
  if (username.length > 20) return "اسم المستخدم يجب ألا يتجاوز 20 حرفًا.";
  if (!USERNAME_PATTERN.test(username)) {
    return "استخدم أحرفًا إنجليزية صغيرة وأرقامًا و _ و . فقط.";
  }
  return null;
}

/** Backend source of truth — never cache completion locally. */
export async function checkProfileCompleted(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_profile_completed");
  if (error) {
    console.error("[profile-completion] is_profile_completed failed", error.message);
    return false;
  }
  return data === true;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_username_available", {
    username_to_check: username,
  });
  if (error) {
    console.error("[profile-completion] is_username_available failed", error.message);
    throw new Error(error.message);
  }
  return data === true;
}

export async function claimUsername(username: string, displayName: string): Promise<void> {
  const trimmedName = displayName.trim();
  if (!trimmedName) throw new Error("Display name is required");

  await ensureUserProfileRow();

  const { error } = await supabase.rpc("claim_username", {
    new_username: username,
    new_display_name: trimmedName,
  });
  if (error) throw new Error(error.message);
}

/** Legacy users created before handle_new_user trigger may lack a row. */
export async function ensureUserProfileRow(): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Unauthorized");

  const { error } = await supabase.from("user_profiles").insert({ user_id: userData.user.id });
  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }
}

export type UserProfileRow = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export async function fetchUserProfileRow(userId: string): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("display_name, username, avatar_url")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    display_name: typeof data.display_name === "string" ? data.display_name : null,
    username: typeof data.username === "string" ? data.username : null,
    avatar_url: typeof data.avatar_url === "string" ? data.avatar_url : null,
  };
}

export function buildUsernameSuggestions(base: string): string[] {
  const b = normalizeUsernameInput(base).replace(/[._]+/g, "").slice(0, 12) || "alpha";
  const candidates = [
    `${b}_1`,
    `${b}91`,
    `${b}.eg`,
    `${b}_alpha`,
    `real${b}`,
  ];
  return [...new Set(candidates.map((s) => s.slice(0, 20)).filter((s) => USERNAME_PATTERN.test(s)))];
}

export async function resolveAvailableSuggestions(base: string): Promise<string[]> {
  const candidates = buildUsernameSuggestions(base);
  const available: string[] = [];
  for (const candidate of candidates) {
    if (available.length >= 5) break;
    try {
      if (await checkUsernameAvailable(candidate)) available.push(candidate);
    } catch {
      /* skip failed checks */
    }
  }
  return available;
}

export async function refreshSessionAndProfile(): Promise<UserProfileRow | null> {
  await supabase.auth.refreshSession();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  return fetchUserProfileRow(userData.user.id);
}

const PROFILE_GATE_PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/intro",
  "/identity/username",
] as const;

export function isProfileGatePublicPath(pathname: string): boolean {
  return PROFILE_GATE_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Full-screen premium auth (no dock / frame) — ALPHA-123 */
export function isPremiumAuthExperience(pathname: string): boolean {
  return (
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/identity/username"
  );
}

export async function resolvePostAuthPath(): Promise<string> {
  const completed = await checkProfileCompleted();
  if (!completed) return "/identity/username";

  const { completePendingChurchJoin } = await import("@/features/church/church-membership-api");
  const joinedChurchId = await completePendingChurchJoin();
  return joinedChurchId ? "/church" : "/home";
}
