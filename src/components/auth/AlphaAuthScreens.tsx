import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate, Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, Mail, LockKeyhole, Eye, EyeOff, LoaderCircle, UserRound, ShieldCheck, Users, HandHeart, Crown } from "lucide-react";
import bgWatermark from "@/assets/bg-watermark.jpg";
import { AlphaWatermark } from "@/components/alpha/AlphaWatermark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { signInWithOAuthProvider } from "@/lib/auth/oauth";
import { mapLoginError } from "@/lib/auth/sign-up";
import { AlphaOfficialSlogan } from "@/components/brand/AlphaOfficialSlogan";
import { clearGuestMode, continueAsGuest } from "@/features/auth/guest-mode";

function arabicAuthError(message: string, context?: { afterRegistration?: boolean }) {
  return mapLoginError(message, context);
}

export function AuthShell({
  title,
  subtitle,
  children,
  hideBack = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  hideBack?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <main dir="rtl" className="relative min-h-screen overflow-x-hidden bg-alpha-cream font-sans text-alpha-navy">
      <img src={bgWatermark} alt="" aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] w-full object-cover opacity-25 mix-blend-luminosity" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-alpha-cream/30 via-alpha-cream/70 to-alpha-cream" />
      <AlphaWatermark />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-[max(env(safe-area-inset-top),12px)]">
        <header className="relative flex flex-col items-center pt-2">
          {!hideBack ? (
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/" })} aria-label="الرجوع إلى الرئيسية" className="absolute right-0 top-2 h-11 w-11 rounded-2xl bg-alpha-paper text-alpha-navy shadow-md ring-1 ring-alpha-gold/30 backdrop-blur-md">
              <ArrowRight className="h-5 w-5" />
            </Button>
          ) : null}
          
          <div className="mt-2 text-[15px] font-bold tracking-[0.2em] text-alpha-gold-dark leading-none">ALPHA</div>
          <div className="mt-1.5 font-coptic text-[14px] tracking-[0.1em] text-alpha-gold-dark leading-none">ⲁⲗⲫⲁ</div>
          <AlphaOfficialSlogan prominent className="mt-3 w-full" />
        </header>

        <section className="mt-6 text-center">
          <h1 className="font-arabic-serif text-3xl font-extrabold leading-tight text-alpha-section-purple">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-alpha-muted">{subtitle}</p>
          <div className="mx-auto mt-3 flex w-32 items-center gap-2 text-alpha-gold">
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-alpha-gold" />
            <span className="text-xs">✦</span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-alpha-gold" />
          </div>
        </section>

        <div className="mt-6 rounded-[var(--alpha-radius-card)] border border-alpha-gold/25 bg-alpha-paper p-5 shadow-xl backdrop-blur-xl sm:p-6">
          {children}
        </div>

        <footer className="mt-auto pt-8 pb-2 text-center text-[11px] font-medium text-alpha-muted/60">
          <span className="font-coptic">ⲁⲗⲫⲁ</span> · Alpha Coptic · إصدار 1.0
        </footer>
      </div>
    </main>
  );
}

export function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-alpha-section-green">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-alpha-gold-dark">{icon}</span>
        {children}
      </div>
    </label>
  );
}

export const inputClass = "h-12 rounded-[var(--alpha-radius-input)] border-alpha-gold/25 bg-background/75 pr-11 text-base text-alpha-navy shadow-sm placeholder:text-alpha-muted/60 focus-visible:ring-alpha-gold";

export function AlphaLoginScreen() {
  const navigate = useNavigate();
  const { registered, oauth, oauthError, email: emailFromSearch, redirect } = useSearch({ from: "/login" });
  const [email, setEmail] = useState(() => emailFromSearch ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);

  const successMessage =
    registered === "confirm"
      ? "تم إنشاء الحساب. افتح رابط التأكيد في بريدك الإلكتروني، ثم سجّل الدخول هنا."
      : registered === "1"
        ? "تم إنشاء حسابك بنجاح. سجّل دخولك بنفس البريد وكلمة المرور."
        : null;

  const afterRegistration = registered === "confirm" || registered === "1";

  const handleOAuth = async (provider: "google" | "apple") => {
    if (loading || oauthLoading) return;
    setError("");
    setOauthLoading(provider);
    try {
      await signInWithOAuthProvider(provider);
    } catch (caught) {
      setError(arabicAuthError(caught instanceof Error ? caught.message : ""));
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw signInError;
      if (!data.user) throw new Error("Missing user");
      clearGuestMode();
      window.localStorage.setItem("alpha_remember_me", remember ? "1" : "0");
      const { ensureUserProfileRow, resolvePostAuthPath } = await import("@/features/auth/profile-completion-api");
      const { refreshAuthContext } = await import("@/features/auth/auth-context");
      await ensureUserProfileRow();
      await refreshAuthContext();
      const target = redirect ?? (await resolvePostAuthPath());
      await navigate({ to: target });
    } catch (caught) {
      setError(
        arabicAuthError(caught instanceof Error ? caught.message : "", {
          afterRegistration: registered === "confirm",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    if (loading || oauthLoading || guestLoading) return;
    setError("");
    setGuestLoading(true);
    try {
      await continueAsGuest();
      await navigate({ to: "/home" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذّر الدخول كضيف.");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <AuthShell title="مرحبًا بعودتك" subtitle="سجّل دخولك لتكمل رحلتك الروحية مع ألفا">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="البريد الإلكتروني" icon={<Mail className="h-5 w-5" />}>
          <Input type="email" dir="ltr" autoComplete="email" inputMode="email" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} />
        </Field>
        <Field label="كلمة المرور" icon={<LockKeyhole className="h-5 w-5" />}>
          <Input type={showPassword ? "text" : "password"} dir="ltr" autoComplete="current-password" required minLength={6} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className={`${inputClass} pl-12`} />
          <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-lg text-alpha-muted hover:bg-alpha-gold/10 hover:text-alpha-navy">
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </Field>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-alpha-muted">
            <Checkbox checked={remember} onCheckedChange={(value) => setRemember(value === true)} className="border-alpha-gold-dark data-[state=checked]:bg-alpha-gold-dark" />
            تذكرني
          </label>
          <Link to="/forgot-password" className="font-bold text-alpha-gold-dark underline-offset-4 hover:underline">نسيت كلمة المرور؟</Link>
        </div>

        {error || oauth === "failed" ? (
          <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm font-medium leading-6 text-destructive">
            {error ||
              (oauthError ? mapLoginError(oauthError) : "تعذّر إكمال تسجيل الدخول عبر Google أو Apple. حاول مرة أخرى.")}
          </div>
        ) : null}

        {successMessage ? (
          <div role="status" className="rounded-xl border border-alpha-gold/30 bg-alpha-gold/10 px-3 py-2.5 text-sm font-medium leading-6 text-alpha-gold-dark">
            {successMessage}
          </div>
        ) : null}

        <Button type="submit" disabled={loading} className="alpha-auth-cta h-12 w-full rounded-xl text-base font-extrabold shadow-lg hover:opacity-95">
          {loading ? <><LoaderCircle className="animate-spin" /> جارٍ تسجيل الدخول...</> : "تسجيل الدخول"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-alpha-muted"><span className="h-px flex-1 bg-alpha-gold/25" /><span>أو</span><span className="h-px flex-1 bg-alpha-gold/25" /></div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={loading || oauthLoading !== null}
          onClick={() => void handleOAuth("apple")}
          className="h-11 rounded-xl border-alpha-gold/35 bg-background/55 text-xs font-bold text-alpha-navy hover:bg-alpha-gold/10"
        >
          {oauthLoading === "apple" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Apple"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading || oauthLoading !== null}
          onClick={() => void handleOAuth("google")}
          className="h-11 rounded-xl border-alpha-gold/35 bg-background/55 text-xs font-bold text-alpha-navy hover:bg-alpha-gold/10"
        >
          {oauthLoading === "google" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Google"}
        </Button>
      </div>

      <Button asChild variant="outline" className="mt-3 h-12 w-full rounded-xl border-alpha-gold/35 bg-background/55 font-bold text-alpha-navy hover:bg-alpha-gold/10">
        <Link to="/register"><UserRound /> إنشاء حساب جديد</Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={loading || oauthLoading !== null || guestLoading}
        onClick={() => void handleGuest()}
        className="mt-3 h-11 w-full rounded-xl border border-dashed border-alpha-gold/35 bg-background/40 font-bold text-alpha-navy hover:bg-alpha-gold/10"
      >
        {guestLoading ? (
          <>
            <LoaderCircle className="animate-spin" /> جارٍ الدخول...
          </>
        ) : (
          "المتابعة كضيف"
        )}
      </Button>

      <p className="mt-5 text-center text-xs leading-6 text-alpha-muted">بالمتابعة، أنت توافق على <span className="font-bold text-alpha-gold-dark">الشروط والأحكام</span> و<span className="font-bold text-alpha-gold-dark">سياسة الخصوصية</span>.</p>
    </AuthShell>
  );
}

type ChurchRole = "member" | "servant" | "priest";

const CHURCH_ROLES: { key: ChurchRole; label: string; desc: string; Icon: React.ElementType }[] = [
  { key: "member",  label: "مؤمن",  desc: "عضو في الكنيسة", Icon: Users },
  { key: "servant", label: "خادم",  desc: "خادم أو شماس",   Icon: HandHeart },
  { key: "priest",  label: "كاهن",  desc: "كاهن أو قسيس",  Icon: Crown },
];

export function AlphaRegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ChurchRole>("member");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name.trim(), role },
      },
    });
    if (signUpError) {
      setError(arabicAuthError(signUpError.message));
    } else {
      if (data.user && data.session) {
        const { ensureUserProfileRow } = await import("@/features/auth/profile-completion-api");
        const { refreshAuthContext } = await import("@/features/auth/auth-context");
        await ensureUserProfileRow();
        await refreshAuthContext();
      }
      setMessage("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.");
    }
    setLoading(false);
  };

  return (
    <AuthShell title="إنشاء حساب" subtitle="أنشئ حسابك لتبدأ رحلتك الروحية مع ألفا">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="الاسم" icon={<UserRound className="h-5 w-5" />}>
          <Input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="الاسم المعروض" />
        </Field>
        <Field label="البريد الإلكتروني" icon={<Mail className="h-5 w-5" />}>
          <Input type="email" dir="ltr" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="name@example.com" />
        </Field>
        <Field label="كلمة المرور" icon={<LockKeyhole className="h-5 w-5" />}>
          <Input
            type={showPassword ? "text" : "password"}
            dir="ltr" required minLength={6} maxLength={72}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pl-12`} placeholder="6 أحرف على الأقل"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-lg text-alpha-muted hover:bg-alpha-gold/10 hover:text-alpha-navy">
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </Field>

        {/* Role selector */}
        <div>
          <span className="mb-2 block text-sm font-extrabold text-alpha-section-purple">دورك في الكنيسة</span>
          <div className="grid grid-cols-3 gap-2">
            {CHURCH_ROLES.map(({ key, label, desc, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-all",
                  role === key
                    ? "alpha-chip-selected-green shadow-sm ring-1 ring-[color-mix(in_srgb,var(--alpha-accent-green)_35%,transparent)]"
                    : "alpha-chip-unselected hover:border-[color-mix(in_srgb,var(--alpha-accent-green)_30%,var(--alpha-border))]",
                )}
              >
                <Icon className={cn("h-5 w-5", role === key ? "text-alpha-accent-green" : "text-alpha-muted")} />
                <span className="text-[13px] font-bold leading-none">{label}</span>
                <span className="text-[10px] leading-tight opacity-75">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {error ? <div role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
        {message ? <div role="status" className="rounded-xl bg-alpha-gold/10 p-3 text-sm leading-6 text-alpha-gold-dark">{message}</div> : null}

        <Button type="submit" disabled={loading} className="alpha-auth-cta-green h-12 w-full rounded-xl font-extrabold shadow-lg hover:opacity-95">
          {loading ? <><LoaderCircle className="animate-spin" /> جارٍ الإنشاء...</> : <><ShieldCheck /> إنشاء الحساب</>}
        </Button>
        <Button asChild variant="ghost" className="w-full text-alpha-gold-dark">
          <Link to="/login">لديك حساب؟ تسجيل الدخول</Link>
        </Button>
      </form>
    </AuthShell>
  );
}

export function AlphaForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (resetError) setError(arabicAuthError(resetError.message)); else setMessage("أرسلنا رابط استعادة كلمة المرور إلى بريدك إن كان الحساب موجودًا.");
    setLoading(false);
  };
  return <AuthShell title="استعادة كلمة المرور" subtitle="أدخل بريدك وسنرسل لك رابط الاستعادة">
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="البريد الإلكتروني" icon={<Mail className="h-5 w-5" />}><Input type="email" dir="ltr" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="name@example.com" /></Field>
      {error ? <div role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
      {message ? <div role="status" className="rounded-xl bg-alpha-gold/10 p-3 text-sm leading-6 text-alpha-gold-dark">{message}</div> : null}
      <Button type="submit" disabled={loading} className="alpha-auth-cta h-12 w-full rounded-xl font-extrabold">{loading ? <LoaderCircle className="animate-spin" /> : <Mail />} إرسال رابط الاستعادة</Button>
      <Button asChild variant="ghost" className="w-full text-alpha-gold-dark"><Link to="/login">العودة لتسجيل الدخول</Link></Button>
    </form>
  </AuthShell>;
}

export function AlphaResetPasswordScreen() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hash.get("type") !== "recovery") {
      setError("رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا."); setLoading(false); return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(arabicAuthError(updateError.message)); else await navigate({ to: "/login" });
    setLoading(false);
  };

  return <AuthShell title="كلمة مرور جديدة" subtitle="اختر كلمة مرور آمنة لحسابك">
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="كلمة المرور الجديدة" icon={<LockKeyhole className="h-5 w-5" />}><Input type="password" dir="ltr" required minLength={6} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="6 أحرف على الأقل" /></Field>
      {error ? <div role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm leading-6 text-destructive">{error}</div> : null}
      <Button type="submit" disabled={loading} className="alpha-auth-cta-green h-12 w-full rounded-xl font-extrabold">{loading ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />} حفظ كلمة المرور</Button>
    </form>
  </AuthShell>;
}