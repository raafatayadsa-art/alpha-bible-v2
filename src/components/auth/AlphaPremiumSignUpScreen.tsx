import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AlphaErrorCard } from "@/components/auth/AlphaErrorCard";
import {
  AlphaAuthSuccessOverlay,
  AlphaPremiumAuthShell,
  AlphaPremiumDivider,
  AlphaPremiumField,
  AlphaPremiumSignInLink,
  AlphaPremiumSocialRow,
} from "@/components/auth/AlphaPremiumAuthShell";
import { Checkbox } from "@/components/ui/checkbox";
import {
  evaluatePasswordStrength,
  passwordStrengthLabel,
  type PasswordStrength,
} from "@/lib/auth/password-strength";
import { alphaHapticSuccess, alphaHapticTap } from "@/lib/auth/haptics";
import { signInWithOAuthProvider, type OAuthProvider } from "@/lib/auth/oauth";
import { mapLoginError, mapSignUpError, registerWithEmail } from "@/lib/auth/sign-up";
import { cn } from "@/lib/utils";

function StrengthIndicator({ strength }: { strength: PasswordStrength }) {
  if (strength === "empty") return null;
  const activeCount = strength === "weak" ? 1 : strength === "medium" ? 2 : 3;
  return (
    <div className="mt-2 text-start">
      <div className="alpha-auth-strength-bar" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "alpha-auth-strength-segment",
              i < activeCount && "is-active",
              i < activeCount && strength,
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] font-bold text-[#8a6a1e]">
        Password strength:{" "}
        <span
          className={cn(
            strength === "weak" && "text-[#d97706]",
            strength === "medium" && "text-[#b8893a]",
            strength === "strong" && "text-[#1f8a5a]",
          )}
        >
          {passwordStrengthLabel(strength)}
        </span>
      </p>
    </div>
  );
}

export function AlphaPremiumSignUpScreen() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState("");
  const [successOverlay, setSuccessOverlay] = useState(false);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = !confirmPassword || password === confirmPassword;
  const canSubmit =
    !loading &&
    termsAccepted &&
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    passwordsMatch &&
    confirmPassword.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    alphaHapticTap();

    try {
      const outcome = await registerWithEmail({
        email,
        password,
        fullName,
      });

      if (outcome.kind === "duplicate") {
        setError("An account with this email already exists. Please sign in.");
        return;
      }

      setSuccessOverlay(true);
      alphaHapticSuccess();
      await new Promise((r) => setTimeout(r, 720));
      setSuccessOverlay(false);
      await navigate({
        to: "/login",
        search: {
          registered: outcome.kind === "ready_to_login" ? "1" : "confirm",
          email: outcome.email,
        },
        replace: true,
      });
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Unexpected error.";
      setError(mapSignUpError(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    if (loading || oauthLoading) return;
    if (!termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setError("");
    setOauthLoading(provider);
    alphaHapticTap();

    try {
      await signInWithOAuthProvider(provider);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Unexpected error.";
      setError(mapLoginError(msg));
      setOauthLoading(null);
    }
  };

  return (
    <>
      {successOverlay ? (
        <AlphaAuthSuccessOverlay message="Account created — sign in to continue your Alpha journey." />
      ) : null}

      <AlphaPremiumAuthShell
        title="Welcome Home"
        subtitle="Create your Alpha account and begin your spiritual journey."
        showUsernameHint
        backTo="/login"
        footer={<AlphaPremiumSignInLink />}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AlphaPremiumField label="Full Name" icon={<UserRound className="h-4 w-4" />}>
            <span className="alpha-auth-field-icon">
              <UserRound className="h-4 w-4" />
            </span>
            <input
              required
              maxLength={100}
              value={fullName}
              onChange={(e) => {
                setError("");
                setFullName(e.target.value);
              }}
              autoComplete="name"
              placeholder="Your name"
              className="alpha-auth-field w-full"
            />
          </AlphaPremiumField>

          <AlphaPremiumField label="Email Address" icon={<Mail className="h-4 w-4" />}>
            <span className="alpha-auth-field-icon">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              required
              dir="ltr"
              maxLength={255}
              value={email}
              onChange={(e) => {
                setError("");
                setEmail(e.target.value);
              }}
              autoComplete="email"
              inputMode="email"
              placeholder="name@example.com"
              className="alpha-auth-field w-full"
            />
          </AlphaPremiumField>

          <AlphaPremiumField
            label="Password"
            icon={<LockKeyhole className="h-4 w-4" />}
            hint={<StrengthIndicator strength={strength} />}
          >
            <span className="alpha-auth-field-icon">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              dir="ltr"
              minLength={6}
              maxLength={72}
              value={password}
              onChange={(e) => {
                setError("");
                setPassword(e.target.value);
              }}
              autoComplete="new-password"
              placeholder="••••••••"
              className="alpha-auth-field w-full pe-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8a6a1e] hover:bg-[#e7c97a]/15"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </AlphaPremiumField>

          <AlphaPremiumField label="Confirm Password" icon={<LockKeyhole className="h-4 w-4" />}>
            <span className="alpha-auth-field-icon">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              required
              dir="ltr"
              minLength={6}
              maxLength={72}
              value={confirmPassword}
              onChange={(e) => {
                setError("");
                setConfirmPassword(e.target.value);
              }}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(
                "alpha-auth-field w-full pe-11",
                confirmPassword && !passwordsMatch && "border-[#a8344f]/50",
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8a6a1e] hover:bg-[#e7c97a]/15"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {confirmPassword && !passwordsMatch ? (
              <p className="mt-1 text-[11px] font-bold text-[#a8344f]">Passwords do not match.</p>
            ) : null}
          </AlphaPremiumField>

          <label className="flex cursor-pointer items-start gap-2.5 text-start">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(v) => {
                setError("");
                setTermsAccepted(v === true);
              }}
              className="mt-0.5 border-[#b8893a] data-[state=checked]:bg-[#b8893a]"
            />
            <span className="text-[12px] font-medium leading-5 text-[#6a543a]">
              I agree to the{" "}
              <Link to="/platform/privacy" className="font-extrabold text-[#b8893a] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/platform/privacy" className="font-extrabold text-[#b8893a] hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error ? <AlphaErrorCard message={error} /> : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="alpha-auth-cta-green mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--alpha-radius-button,18px)] text-[14px] font-extrabold transition active:scale-[0.98]"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
                Creating account…
              </>
            ) : (
              <>
                Create My Alpha Account
                <Sparkles className="h-4 w-4 opacity-80" aria-hidden />
              </>
            )}
          </button>
        </form>

        <AlphaPremiumDivider />
        <AlphaPremiumSocialRow
          onApple={() => void handleOAuth("apple")}
          onGoogle={() => void handleOAuth("google")}
          loadingProvider={oauthLoading}
          disabled={loading}
        />
      </AlphaPremiumAuthShell>
    </>
  );
}
