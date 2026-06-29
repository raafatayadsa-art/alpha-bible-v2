import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import bgWatermark from "@/assets/bg-watermark.jpg";
import { cn } from "@/lib/utils";
import "./alpha-auth-premium.css";

export function AlphaPremiumAuthShell({
  title,
  subtitle,
  children,
  footer,
  hideBack = false,
  backTo = "/login",
  showUsernameHint = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  hideBack?: boolean;
  backTo?: string;
  showUsernameHint?: boolean;
}) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 24);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main
      dir="ltr"
      className={cn(
        "alpha-auth-premium relative min-h-[100dvh] overflow-hidden font-sans text-[var(--alpha-text-primary,#3a2a18)]",
        scrolled && "alpha-auth-premium-scrolled",
      )}
    >
      <div className="alpha-auth-premium-bg pointer-events-none absolute inset-0" aria-hidden />
      <img
        src={bgWatermark}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[58vh] w-full object-cover opacity-[0.14] mix-blend-luminosity"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#fbf3e1]/40 to-[#efe2c4]/90"
        aria-hidden
      />

      <div
        ref={scrollRef}
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col overflow-y-auto overscroll-y-contain px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),12px)]"
      >
        {!hideBack ? (
          <button
            type="button"
            onClick={() => navigate({ to: backTo })}
            aria-label="Back"
            className="absolute start-4 top-[max(env(safe-area-inset-top),14px)] z-20 grid h-10 w-10 place-items-center rounded-full border border-[#efe2c4]/80 bg-white/75 text-[#6a543a] shadow-sm backdrop-blur-md transition active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}

        <header className="alpha-auth-premium-hero flex flex-col items-center pt-10 text-center">
          <h1 className="font-arabic-serif text-[2rem] font-extrabold leading-tight tracking-tight text-alpha-section-purple">
            {title}
          </h1>
          <p className="mt-2 max-w-[18rem] text-[13px] font-medium leading-6 text-[#6a543a]">{subtitle}</p>
          <div className="mt-3 flex w-28 items-center gap-2 text-[#b8893a]">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e7c97a]" />
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e7c97a]" />
          </div>
        </header>

        <div className="alpha-auth-glass-card mt-6 p-5 sm:p-6">{children}</div>

        {footer ? <div className="mt-5">{footer}</div> : null}

        {showUsernameHint ? (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-[#8a6a1e]">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#b8893a]" aria-hidden />
            Your Alpha Username will be chosen in the next step.
          </p>
        ) : null}

        <footer className="mt-auto pt-8 text-center text-[10px] font-medium text-[#8a6a1e]/70">
          Alpha Coptic · v1.0
        </footer>
      </div>
    </main>
  );
}

export function AlphaPremiumField({
  label,
  icon,
  children,
  hint,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="block text-start">
      <span className="mb-1.5 block text-[12px] font-extrabold text-alpha-section-green">{label}</span>
      <div className="relative">{children}</div>
      {hint}
    </label>
  );
}

export function AlphaPremiumDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-[#8a6a1e]/70">
      <span className="h-px flex-1 bg-[#efe2c4]" />
      <span>OR</span>
      <span className="h-px flex-1 bg-[#efe2c4]" />
    </div>
  );
}

export function AlphaPremiumSocialRow({
  onApple,
  onGoogle,
  loadingProvider = null,
  disabled = false,
}: {
  onApple: () => void;
  onGoogle: () => void;
  loadingProvider?: OAuthProvider | null;
  disabled?: boolean;
}) {
  const busy = disabled || loadingProvider !== null;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        disabled={busy}
        onClick={onApple}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--alpha-radius-button,18px)] border border-[#efe2c4] bg-white/70 text-[11px] font-bold text-[#6a543a] transition active:scale-[0.98] disabled:opacity-60"
      >
        {loadingProvider === "apple" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <AppleMark className="h-4 w-4" />
        )}
        Apple
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onGoogle}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--alpha-radius-button,18px)] border border-[#efe2c4] bg-white/70 text-[11px] font-bold text-[#6a543a] transition active:scale-[0.98] disabled:opacity-60"
      >
        {loadingProvider === "google" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <GoogleMark className="h-4 w-4" />
        )}
        Google
      </button>
    </div>
  );
}

type OAuthProvider = "google" | "apple";

function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.415 2.09-1.245 2.865-.83.775-1.83 1.155-3 1.08-.14-1.09.4-2.14 1.17-2.88.77-.74 1.88-1.22 3.075-1.065zm1.08 3.285c-1.755-.1-3.25.995-4.09.995-.855 0-2.16-.975-3.555-.95-1.83.03-3.515 1.065-4.455 2.705-1.905 3.3-.495 8.19 1.365 10.875 1.005 1.455 2.19 3.09 3.75 3.03 1.515-.06 2.085-.975 3.915-.975 1.83 0 2.325.975 3.915.945 1.62-.03 2.64-1.485 3.63-2.955 1.14-1.665 1.605-3.285 1.635-3.375-.03-.015-3.135-1.2-3.165-4.755-.03-2.97 2.445-4.395 2.565-4.47-1.395-2.04-3.57-2.295-4.335-2.34z" />
    </svg>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function AlphaPremiumSignInLink() {
  return (
    <p className="text-center text-[13px] font-semibold text-[#6a543a]">
      Already have an account?{" "}
      <Link to="/login" className="font-extrabold text-[#b8893a] hover:underline">
        Sign In →
      </Link>
    </p>
  );
}

export function AlphaAuthSuccessOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fbf3e1]/75 backdrop-blur-sm px-6">
      <div className="alpha-auth-success-overlay max-w-xs rounded-[var(--alpha-radius-card,26px)] border border-[#e7c97a]/50 bg-white/90 px-6 py-8 text-center shadow-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#1f8a5a]/12 text-[#1f8a5a]">
          <Sparkles className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-4 text-[15px] font-extrabold leading-6 text-[#3a2a18]">{message}</p>
      </div>
    </div>
  );
}
