import { useEffect } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlphaAuth } from "@/features/auth";
import { isProfileCompleted, profileCompletionQueryKey } from "./profile-api";

/**
 * Routes that an authenticated user may reach WITHOUT having completed the
 * mandatory Alpha username onboarding (auth recovery + the onboarding screen
 * itself + the first-run intro/splash entry).
 */
const PUBLIC_PATHS = new Set<string>([
  "/",
  "/intro",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/username-onboarding",
]);

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

function GuardFallback() {
  return (
    <div
      dir="rtl"
      className="flex min-h-[100dvh] w-full items-center justify-center bg-[#f4ead8]"
      aria-busy="true"
    >
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#e7c97a] border-t-[#b8893a]" />
    </div>
  );
}

/**
 * Application guard for every protected route. After authentication it ALWAYS
 * re-runs `is_profile_completed()` against the backend (never a cached flag) and
 * redirects users with an incomplete profile to the mandatory username
 * onboarding screen before any protected content can render.
 */
export function GuardedOutlet() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, loading: authLoading } = useAlphaAuth();
  const userId = user?.id ?? null;

  const isPublic = isPublicPath(pathname);
  const enabled = isAuthenticated && !!userId && !isPublic;

  const { data: completed } = useQuery({
    queryKey: profileCompletionQueryKey(userId),
    queryFn: isProfileCompleted,
    enabled,
    // Backend is the single source of truth — never serve a stale completion flag.
    staleTime: 0,
    gcTime: 0,
  });

  // Re-verify against the backend on every protected-route navigation.
  useEffect(() => {
    if (enabled) {
      void queryClient.invalidateQueries({ queryKey: profileCompletionQueryKey(userId) });
    }
  }, [pathname, enabled, userId, queryClient]);

  useEffect(() => {
    if (enabled && completed === false) {
      void navigate({ to: "/username-onboarding", replace: true });
    }
  }, [enabled, completed, navigate]);

  if (isPublic) return <Outlet />;
  // Block protected content until the backend confirms profile completion.
  if (enabled && authLoading) return <GuardFallback />;
  if (enabled && completed !== true) return <GuardFallback />;
  return <Outlet />;
}
