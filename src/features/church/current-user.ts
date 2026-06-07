import { supabase } from "@/integrations/supabase/client";
import {
  getAuthUserSync,
  getAlphaRoleSync,
  isPlatformOwnerSync,
  subscribeAuthContext,
  alphaRoleToChurchRole,
  canManageChurchPosts,
  type AlphaAuthUser,
} from "@/features/auth";

export type CurrentUser = {
  id: string;
  name: string;
  avatarUrl: string;
};

const EMPTY_GUEST: CurrentUser = {
  id: "",
  name: "",
  avatarUrl: "https://i.pravatar.cc/80?u=alpha-guest",
};

function fromAuth(user: AlphaAuthUser): CurrentUser {
  return {
    id: user.id,
    name: user.displayName,
    avatarUrl: user.avatarUrl ?? EMPTY_GUEST.avatarUrl,
  };
}

/** Sync snapshot — populated by AuthBootstrap from Supabase Auth. */
export function getCurrentUser(): CurrentUser {
  const user = getAuthUserSync();
  if (!user) return EMPTY_GUEST;
  return fromAuth(user);
}

export function currentUserName(): string {
  const user = getAuthUserSync();
  return user?.displayName?.trim() || "مستخدم Alpha";
}

export function isAuthenticated(): boolean {
  return !!getAuthUserSync()?.id;
}

export { subscribeAuthContext };
