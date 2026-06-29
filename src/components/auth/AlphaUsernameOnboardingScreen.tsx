import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AtSign, Check, LoaderCircle, Sparkles, UserRound, X } from "lucide-react";
import { refreshAuthContext } from "@/features/auth";
import {
  checkUsernameAvailable,
  claimUsername,
  normalizeUsernameInput,
  refreshSessionAndProfile,
  resolveAvailableSuggestions,
  validateUsernameFormat,
} from "@/features/auth/profile-completion-api";
import { AlphaErrorCard } from "@/components/auth/AlphaErrorCard";
import {
  AlphaAuthSuccessOverlay,
  AlphaPremiumAuthShell,
  AlphaPremiumField,
} from "@/components/auth/AlphaPremiumAuthShell";
import { alphaHapticSuccess, alphaHapticTap } from "@/lib/auth/haptics";
import { cn } from "@/lib/utils";

type AvailabilityState = "idle" | "checking" | "available" | "taken" | "invalid";

export function AlphaUsernameOnboardingScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [availability, setAvailability] = useState<AvailabilityState>("idle");
  const [availabilityError, setAvailabilityError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    void (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata ?? {};
      const fromMeta =
        (typeof meta.display_name === "string" && meta.display_name.trim()) ||
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        "";
      if (fromMeta) setDisplayName(fromMeta);
    })();
  }, []);

  const runAvailabilityCheck = useCallback(async (value: string) => {
    const formatError = validateUsernameFormat(value);
    if (formatError) {
      setAvailability("invalid");
      setAvailabilityError(formatError);
      setSuggestions([]);
      return;
    }

    const seq = ++requestSeq.current;
    setAvailability("checking");
    setAvailabilityError("");
    setSuggestions([]);

    try {
      const available = await checkUsernameAvailable(value);
      if (requestSeq.current !== seq) return;

      if (available) {
        setAvailability("available");
        setSuggestions([]);
      } else {
        setAvailability("taken");
        const next = await resolveAvailableSuggestions(value);
        if (requestSeq.current !== seq) return;
        setSuggestions(next);
      }
    } catch (err) {
      if (requestSeq.current !== seq) return;
      setAvailability("invalid");
      setAvailabilityError(err instanceof Error ? err.message : "Could not verify username.");
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const normalized = normalizeUsernameInput(username);
    if (!normalized) {
      setAvailability("idle");
      setAvailabilityError("");
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void runAvailabilityCheck(normalized);
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, runAvailabilityCheck]);

  const normalizedUsername = normalizeUsernameInput(username);
  const canContinue =
    !submitting &&
    availability === "available" &&
    normalizedUsername.length >= 4 &&
    displayName.trim().length > 0;

  const handleUsernameChange = (raw: string) => {
    setSubmitError("");
    setUsername(normalizeUsernameInput(raw));
  };

  const applySuggestion = (value: string) => {
    setSubmitError("");
    setUsername(value);
    alphaHapticTap();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canContinue || submitting) return;

    setSubmitting(true);
    setSubmitError("");
    alphaHapticTap();

    try {
      await claimUsername(normalizedUsername, displayName.trim());
      const profile = await refreshSessionAndProfile();
      await refreshAuthContext();

      if (!profile?.username || !profile.display_name) {
        throw new Error("Profile refresh incomplete — username or display name missing.");
      }

      setSuccessOverlay(true);
      alphaHapticSuccess();
      await new Promise((r) => setTimeout(r, 680));
      setSuccessOverlay(false);
      await navigate({ to: "/home", replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {successOverlay ? (
        <AlphaAuthSuccessOverlay message={`Welcome, @${normalizedUsername}! Your Alpha identity is ready.`} />
      ) : null}

      <AlphaPremiumAuthShell
        hideBack
        title="Choose Your Alpha Username"
        subtitle="Choose your permanent Alpha identity. Your username will be used for Search, Alpha Connect, QR Identity, Profile Sharing, and Future Mentions."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlphaPremiumField label="Username" icon={<AtSign className="h-4 w-4" />}>
            <span className="alpha-auth-field-icon">
              <AtSign className="h-4 w-4" />
            </span>
            <input
              dir="ltr"
              autoComplete="username"
              inputMode="text"
              required
              maxLength={20}
              value={username}
              onChange={(event) => handleUsernameChange(event.target.value)}
              placeholder="raafat"
              className="alpha-auth-field w-full"
              aria-describedby="username-live-preview"
            />
          </AlphaPremiumField>

          <p id="username-live-preview" dir="ltr" className="text-[14px] font-extrabold text-[#b8893a]">
            {normalizedUsername ? `@${normalizedUsername}` : "@…"}
          </p>

          {availability === "checking" ? (
            <p className="flex items-center gap-2 text-[13px] font-semibold text-[#8a6a1e]">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              Checking availability…
            </p>
          ) : null}

          {availability === "available" ? (
            <p className="flex items-center gap-2 text-[13px] font-extrabold text-[#1f8a5a]">
              <Check className="h-4 w-4" aria-hidden />
              Username Available
            </p>
          ) : null}

          {availability === "taken" ? (
            <p className="flex items-center gap-2 text-[13px] font-extrabold text-[#a8344f]">
              <X className="h-4 w-4" aria-hidden />
              Username Already Taken
            </p>
          ) : null}

          {availability === "invalid" && availabilityError ? (
            <AlphaErrorCard message={availabilityError} />
          ) : null}

          {suggestions.length > 0 ? (
            <div className="space-y-2 text-start">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#8a6a1e]">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    dir="ltr"
                    onClick={() => applySuggestion(suggestion)}
                    className={cn(
                      "rounded-full border border-[#e7c97a]/45 bg-white/80 px-3 py-1.5 text-[12px] font-bold text-[#3a2a18]",
                      "transition hover:border-[#b8893a] hover:bg-[#fff8e8] active:scale-95",
                    )}
                  >
                    @{suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <AlphaPremiumField label="Display Name" icon={<UserRound className="h-4 w-4" />}>
            <span className="alpha-auth-field-icon">
              <UserRound className="h-4 w-4" />
            </span>
            <input
              required
              maxLength={100}
              value={displayName}
              onChange={(event) => {
                setSubmitError("");
                setDisplayName(event.target.value);
              }}
              placeholder="رأفت سمير"
              className="alpha-auth-field w-full"
              dir="auto"
            />
          </AlphaPremiumField>

          {submitError ? <AlphaErrorCard message={submitError} /> : null}

          <button
            type="submit"
            disabled={!canContinue}
            className="alpha-auth-cta-green flex h-12 w-full items-center justify-center gap-2 rounded-[var(--alpha-radius-button,18px)] text-[14px] font-extrabold transition active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                Continue
                <Sparkles className="h-4 w-4 opacity-80" aria-hidden />
              </>
            )}
          </button>
        </form>
      </AlphaPremiumAuthShell>
    </>
  );
}
