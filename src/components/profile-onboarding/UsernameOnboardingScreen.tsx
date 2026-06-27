import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AtSign, Check, LoaderCircle, ShieldCheck, UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { refreshAuthContext, useAlphaAuth } from "@/features/auth";
import { AlphaBrandIdentity } from "@/components/brand";
import {
  buildUsernameSuggestions,
  claimUsername,
  fetchUserProfile,
  isProfileCompleted,
  isUsernameAvailable,
  profileCompletionQueryKey,
  sanitizeUsernameInput,
  userProfileQueryKey,
  validateUsernameFormat,
} from "@/features/profile";

const palette = {
  bg: "#f4ead8",
  surface: "#fbf3e1",
  surfaceBorder: "#efe2c4",
  ink: "#3a2a18",
  inkSoft: "#6a543a",
  gold: "#b8893a",
} as const;

const cardClass =
  "relative overflow-hidden rounded-[24px] border border-[#efe2c4]/90 bg-gradient-to-b from-[#fbf3e1]/96 to-[#f4ead8]/94 backdrop-blur-xl";
const cardStyle = {
  boxShadow:
    "0 18px 38px -22px rgba(120,80,30,0.55), 0 0 28px -14px rgba(184,137,58,0.33), inset 0 1px 0 rgba(255,255,255,0.7)",
} as const;

const fieldClass =
  "w-full rounded-xl border border-[#efe2c4]/90 bg-white/75 px-3.5 py-3 text-[15px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/70 shadow-[inset_0_1px_2px_rgba(120,80,30,0.05)] backdrop-blur-sm outline-none transition focus:border-[#b8893a]/55 focus:ring-2 focus:ring-[#b8893a]/25";
const labelClass = "mb-1.5 block text-[12px] font-bold text-[#6a543a]";

const goldButtonStyle = {
  background: "linear-gradient(135deg, #d4a843 0%, #b8893a 100%)",
  color: "#2a1a08",
  boxShadow: "0 12px 32px -12px rgba(184,137,58,0.8)",
} as const;

type Availability = "idle" | "checking" | "available" | "taken";

export function UsernameOnboardingScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading: authLoading } = useAlphaAuth();
  const userId = user?.id ?? null;

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Tracks the most recent username we issued an availability request for, so
  // out-of-order responses from debounced checks are ignored.
  const latestCheck = useRef("");

  const formatError = useMemo(
    () => (username.length === 0 ? null : validateUsernameFormat(username)),
    [username],
  );

  // Already-completed users must never see the onboarding screen; send them in.
  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!isAuthenticated) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    void isProfileCompleted()
      .then((completed) => {
        if (active && completed) void navigate({ to: "/home", replace: true });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, navigate]);

  // Debounced backend availability check.
  useEffect(() => {
    setSuggestions([]);
    if (!username) {
      setAvailability("idle");
      return;
    }
    if (formatError) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    latestCheck.current = username;
    const handle = window.setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(username);
        if (latestCheck.current !== username) return;
        setAvailability(available ? "available" : "taken");
      } catch {
        if (latestCheck.current !== username) return;
        setAvailability("idle");
      }
    }, 450);
    return () => window.clearTimeout(handle);
  }, [username, formatError]);

  // Generate + backend-validate up to five suggestions when the name is taken.
  useEffect(() => {
    if (availability !== "taken") return;
    let active = true;
    setSuggestionsLoading(true);
    const base = username;
    (async () => {
      const candidates = buildUsernameSuggestions(base);
      const checked = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            return (await isUsernameAvailable(candidate)) ? candidate : null;
          } catch {
            return null;
          }
        }),
      );
      if (!active) return;
      setSuggestions(checked.filter((value): value is string => value !== null).slice(0, 5));
      setSuggestionsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [availability, username]);

  const canSubmit =
    !submitting && availability === "available" && !formatError && displayName.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !userId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // 1. Persist the permanent identity via the backend RPC.
      await claimUsername(username, displayName.trim());

      // 2. Refresh the authenticated Supabase session + reload the user.
      await supabase.auth.refreshSession();
      await supabase.auth.getUser();

      // 3. Reload user_profiles straight from the backend and verify in memory.
      const profile = await fetchUserProfile(userId);
      if (!profile?.username || !profile?.displayName) {
        // Defensive: backend did not report a completed profile.
        throw new Error("تعذر تأكيد حفظ الهوية. حاول مرة أخرى.");
      }

      // 4-6. Refresh the auth provider + invalidate cached profile providers.
      await refreshAuthContext();
      await queryClient.invalidateQueries({ queryKey: userProfileQueryKey(userId) });
      await queryClient.invalidateQueries({ queryKey: profileCompletionQueryKey(userId) });

      // 7. Only now enter the application.
      await navigate({ to: "/home", replace: true });
    } catch (caught) {
      // Surface the exact backend message (no substitution).
      setSubmitError(caught instanceof Error ? caught.message : String(caught));
      setSubmitting(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans"
      style={{ background: palette.bg }}
    >
      <div
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 24px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        }}
      >
        <header className="flex flex-col items-center pt-2">
          <AlphaBrandIdentity logoSize="md" />
          <h1
            className="mt-4 text-center text-[22px] font-extrabold leading-tight"
            style={{ color: palette.ink }}
          >
            Choose Your Alpha Username
          </h1>
        </header>

        <form onSubmit={handleSubmit} className={`mt-6 p-5 ${cardClass}`} style={cardStyle}>
          <p className="text-[13px] leading-6" style={{ color: palette.inkSoft }}>
            Choose your permanent Alpha identity. Your username will be used for:
            <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold">
              <span>· Search</span>
              <span>· Alpha Connect</span>
              <span>· QR Identity</span>
              <span>· Profile Sharing</span>
              <span>· Future Mentions</span>
            </span>
          </p>

          {/* Username */}
          <div className="mt-5">
            <label className={labelClass} htmlFor="alpha-username">
              Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#b8893a]">
                <UserRound className="h-5 w-5" />
              </span>
              <input
                id="alpha-username"
                dir="ltr"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(event) => setUsername(sanitizeUsernameInput(event.target.value))}
                placeholder="raafat"
                maxLength={20}
                className={`${fieldClass} pr-11 text-left`}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                {availability === "checking" && (
                  <LoaderCircle className="h-5 w-5 animate-spin text-[#b8893a]" />
                )}
                {availability === "available" && (
                  <Check className="h-5 w-5 text-[#1f8a5b]" strokeWidth={3} />
                )}
                {availability === "taken" && (
                  <X className="h-5 w-5 text-[#c0504a]" strokeWidth={3} />
                )}
              </span>
            </div>

            {/* Live @username preview */}
            <div className="mt-2 flex items-center gap-1.5 text-[14px] font-bold" dir="ltr">
              <AtSign className="h-4 w-4 text-[#b8893a]" />
              <span style={{ color: palette.gold }}>{username || "raafat"}</span>
            </div>

            {/* Format / availability status */}
            {formatError ? (
              <p className="mt-2 text-[12px] font-semibold text-[#c0504a]">{formatError}</p>
            ) : availability === "available" ? (
              <p className="mt-2 text-[12px] font-bold text-[#1f8a5b]">✅ Username Available</p>
            ) : availability === "taken" ? (
              <p className="mt-2 text-[12px] font-bold text-[#c0504a]">❌ Username Already Taken</p>
            ) : null}

            {/* Suggestions when taken */}
            {availability === "taken" && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-bold text-[#6a543a]">اقتراحات متاحة:</p>
                {suggestionsLoading ? (
                  <div className="flex items-center gap-2 text-[12px] text-[#9a7e5a]">
                    <LoaderCircle className="h-4 w-4 animate-spin" /> جارٍ توليد اقتراحات…
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2" dir="ltr">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setUsername(suggestion)}
                        className="rounded-full border border-[#efe2c4] bg-white/70 px-3 py-1.5 text-[13px] font-bold text-[#3a2a18] shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)] transition active:scale-95 hover:border-[#b8893a]/50"
                      >
                        @{suggestion}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#9a7e5a]">لا توجد اقتراحات متاحة حاليًا.</p>
                )}
              </div>
            )}
          </div>

          {/* Display Name */}
          <div className="mt-5">
            <label className={labelClass} htmlFor="alpha-display-name">
              Display Name
            </label>
            <input
              id="alpha-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="رأفت سمير"
              maxLength={80}
              className={fieldClass}
            />
          </div>

          {/* Backend error (exact message, Alpha error card) */}
          {submitError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-[#e8a8a8]/60 bg-[#fff0f0]/80 px-3 py-2.5 text-center text-[12.5px] font-bold text-[#a85450]"
            >
              {submitError}
            </p>
          )}

          {/* Continue */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={goldButtonStyle}
            className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" /> جارٍ الحفظ…
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" /> Continue
              </>
            )}
          </button>
        </form>

        <div className="mt-auto pt-6 text-center text-[10px] font-medium text-[#9a7e5a]/70">
          <span className="font-coptic">ⲁⲗⲫⲁ</span> · Alpha Identity
        </div>
      </div>
    </main>
  );
}
