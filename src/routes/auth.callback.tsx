import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { refreshAuthContext } from "@/features/auth";
import { clearGuestMode } from "@/features/auth/guest-mode";
import { ensureUserProfileRow, resolvePostAuthPath } from "@/features/auth/profile-completion-api";
import { completeOAuthCallback } from "@/lib/auth/oauth";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing in — Alpha" }] }),
  component: AuthCallbackScreen,
});

function AuthCallbackScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { session, error: oauthError } = await completeOAuthCallback();

      if (oauthError) {
        if (!cancelled) {
          await navigate({
            to: "/login",
            search: { oauth: "failed", oauthError: oauthError.message.slice(0, 120) },
            replace: true,
          });
        }
        return;
      }

      if (!session) {
        if (!cancelled) {
          await navigate({ to: "/login", search: { oauth: "failed" }, replace: true });
        }
        return;
      }

      try {
        clearGuestMode();
        await ensureUserProfileRow();
        await refreshAuthContext();
        const target = await resolvePostAuthPath();
        if (!cancelled) {
          await navigate({ to: target, replace: true });
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Sign-in failed.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <main
        dir="ltr"
        className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#fbf3e1] px-6 text-center font-sans text-[#3a2a18]"
      >
        <p className="text-sm font-semibold text-[#a8344f]">{error}</p>
        <button
          type="button"
          onClick={() => void navigate({ to: "/login", replace: true })}
          className="mt-4 rounded-[18px] bg-[#3a2a18] px-5 py-2.5 text-sm font-bold text-white"
        >
          Back to Sign In
        </button>
      </main>
    );
  }

  return (
    <main
      dir="ltr"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-[#fbf3e1] font-sans text-[#6a543a]"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-[#b8893a]" aria-hidden />
      <p className="text-sm font-semibold">Completing sign-in…</p>
    </main>
  );
}
