import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useAlphaAuth, AUTH_CONTEXT_EVENT } from "@/features/auth";
import {
  fetchUserProfile,
  profileCompletionQueryKey,
  userProfileQueryKey,
  type UserProfile,
} from "./profile-api";

/**
 * Reads the authenticated user's `user_profiles` record (username + display name)
 * from the backend. Components that show the Alpha identity read from here so a
 * fresh claim is reflected instantly once the query is invalidated — no logout,
 * login, restart or pull-to-refresh required.
 */
export function useUserProfile() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAlphaAuth();
  const userId = user?.id ?? null;

  const query = useQuery<UserProfile | null>({
    queryKey: userProfileQueryKey(userId),
    queryFn: () => fetchUserProfile(userId as string),
    enabled: isAuthenticated && !!userId,
    staleTime: 0,
  });

  // Keep the profile in sync with global auth-context refreshes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onAuth = () => {
      void queryClient.invalidateQueries({ queryKey: userProfileQueryKey(userId) });
    };
    window.addEventListener(AUTH_CONTEXT_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CONTEXT_EVENT, onAuth);
  }, [queryClient, userId]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: userProfileQueryKey(userId) });
    await queryClient.invalidateQueries({ queryKey: profileCompletionQueryKey(userId) });
  }, [queryClient, userId]);

  return {
    profile: query.data ?? null,
    username: query.data?.username ?? null,
    displayName: query.data?.displayName ?? null,
    loading: query.isLoading,
    refresh,
  };
}
