import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LoaderCircle, LogIn, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAlphaAuth } from "@/features/auth";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";

const SESSION_PROBE_MS = 2500;

function ProfileAuthLoading() {
  return (
    <div
      dir="rtl"
      className="flex min-h-[100dvh] items-center justify-center bg-alpha-base text-alpha-heading"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-alpha-gold-bright" aria-hidden />
      <span className="sr-only">جارٍ التحقق من الحساب…</span>
    </div>
  );
}

function ProfileLoginRequired({ redirectTo }: { redirectTo: string }) {
  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-alpha-base">
      <CopticWatermark />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[var(--alpha-content-max-width)] flex-col items-center justify-center px-6 pb-32 pt-[max(env(safe-area-inset-top),16px)] text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-[#e7c97a]/50 bg-white/70 shadow-[0_12px_32px_-16px_rgba(120,80,30,0.35)]">
          <UserRound className="h-9 w-9 text-[#7a6548]" strokeWidth={2.1} />
        </div>
        <h1 className="mt-5 text-[20px] font-extrabold text-alpha-heading">سجّل دخولك لعرض ملفك</h1>
        <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-alpha-heading-muted">
          على الموبايل يجب تسجيل الدخول لعرض نفس الاسم والصورة كما على المتصفح.
        </p>
        <Link
          to="/login"
          search={{ redirect: redirectTo }}
          className="mt-6 inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-2xl alpha-auth-cta px-6 text-[14px] font-extrabold shadow-lg active:scale-[0.98] transition-transform"
        >
          <LogIn className="h-4 w-4" />
          تسجيل الدخول
        </Link>
      </div>
      <BottomDock />
    </div>
  );
}

export function ProfileAuthGate({
  redirectTo,
  children,
}: {
  redirectTo: string;
  children: ReactNode;
}) {
  const { isAuthenticated, loading, refresh } = useAlphaAuth();
  const [probeDone, setProbeDone] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setHasSession(!!data.session?.user);
      setProbeDone(true);
    });

    const timer = window.setTimeout(() => {
      if (!cancelled) setProbeDone(true);
    }, SESSION_PROBE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (hasSession) void refresh();
  }, [hasSession, refresh]);

  const admitted = isAuthenticated || hasSession;
  const waiting = !probeDone && loading && !admitted;

  if (waiting) return <ProfileAuthLoading />;
  if (probeDone && !admitted) return <ProfileLoginRequired redirectTo={redirectTo} />;
  return children;
}
