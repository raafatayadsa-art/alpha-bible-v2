import { type ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAlphaAuth } from "./auth-context";
import { checkProfileCompleted, isProfileGatePublicPath } from "./profile-completion-api";

/** Routes that must stay reachable while profile completion is checked. */
const PROFILE_COMPLETION_SKIP_REDIRECT = [
  "/home",
  "/settings",
  "/profile",
  "/community",
  "/prayer-requests",
  "/login",
  "/register",
  "/intro",
  "/identity/username",
] as const;

function shouldSkipProfileCompletionRedirect(pathname: string): boolean {
  if (isProfileGatePublicPath(pathname)) return true;
  if (pathname === "/community" || pathname.startsWith("/community/")) return true;
  if (pathname === "/prayer-requests" || pathname.startsWith("/prayer-requests/")) return true;
  return PROFILE_COMPLETION_SKIP_REDIRECT.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function checkProfileCompletedWithTimeout(ms = 6000): Promise<boolean> {
  return Promise.race([
    checkProfileCompleted(),
    new Promise<boolean>((resolve) => window.setTimeout(() => resolve(true), ms)),
  ]).catch(() => true);
}

/**
 * ALPHA-122 — Blocks authenticated users without username until onboarding completes.
 * Always re-checks via RPC (never local cache).
 */
export function ProfileCompletionGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthenticated, loading: authLoading } = useAlphaAuth();
  const [checking, setChecking] = useState(false);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const checkSeq = useRef(0);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setCompleted(null);
      setChecking(false);
      return;
    }

    const seq = ++checkSeq.current;
    setChecking(true);

    void checkProfileCompletedWithTimeout()
      .then((result) => {
        if (checkSeq.current !== seq) return;
        setCompleted(result);
      })
      .catch(() => {
        if (checkSeq.current !== seq) return;
        // Fail-open on flaky mobile networks — don't trap users on username screen.
        setCompleted(true);
      })
      .finally(() => {
        if (checkSeq.current !== seq) return;
        setChecking(false);
      });
  }, [isAuthenticated, authLoading, pathname]);

  useEffect(() => {
    if (authLoading || checking || !isAuthenticated || completed === null) return;

    const onIdentityRoute = pathname === "/identity/username";

    if (!completed && !onIdentityRoute && !shouldSkipProfileCompletionRedirect(pathname)) {
      navigate({ to: "/identity/username", replace: true });
      return;
    }

    if (completed && onIdentityRoute) {
      navigate({ to: "/home", replace: true });
    }
  }, [authLoading, checking, completed, isAuthenticated, navigate, pathname]);

  return children;
}
