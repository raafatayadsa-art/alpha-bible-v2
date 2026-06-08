import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import {
  devSignIn,
  devSignOut,
  devSignUp,
  getAuthUserId,
  useAlphaAuth,
} from "@/features/auth";

export const Route = createFileRoute("/dev/auth")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Dev Auth — Alpha" }, { name: "robots", content: "noindex" }],
  }),
  component: DevAuthPage,
});

function DevAuthPage() {
  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  return <DevAuthScreen />;
}

function DevAuthScreen() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refresh } = useAlphaAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);

  useEffect(() => {
    void getAuthUserId().then(setAuthUid);
  }, [user]);

  async function run(action: "signIn" | "signUp") {
    setBusy(true);
    setMessage(null);
    try {
      const result =
        action === "signIn" ? await devSignIn(email, password) : await devSignUp(email, password);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setMessage(`تم — auth.uid(): ${result.userId}`);
      await refresh();
      setAuthUid(result.userId);
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    setBusy(true);
    setMessage(null);
    try {
      await devSignOut();
      await refresh();
      setAuthUid(null);
      setMessage("تم تسجيل الخروج");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await run("signIn");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10" dir="rtl">
      <p className="text-xs text-[#8a7355]">مسار تطوير فقط — /dev/auth</p>
      <h1 className="mt-2 font-arabic-serif text-xl font-bold text-[#3a2a18]">Supabase Auth (Dev)</h1>
      <p className="mt-2 text-sm text-[#6a543a]">
        يربط المتصفح بـ Supabase Auth حتى يعمل auth.uid() و backfill لـ church_memberships.
      </p>

      <div className="mt-6 space-y-2 rounded-2xl border border-[#efe2c4] bg-white/80 p-4 text-sm">
        <Row label="جلسة Alpha Auth" value={isAuthenticated ? "نعم" : "لا"} />
        <Row label="auth.uid()" value={authUid ?? user?.id ?? "—"} />
        <Row label="البريد" value={user?.email ?? "—"} />
      </div>

      {isAuthenticated ? (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-[#3f9d6e] text-sm font-bold text-white disabled:opacity-60"
            onClick={() => navigate({ to: "/profile/church" })}
          >
            فتح /profile/church
          </button>
          <button
            type="button"
            disabled={busy}
            className="h-11 w-full rounded-xl border border-[#efe2c4] bg-white/75 text-sm font-bold text-[#3a2a18] disabled:opacity-60"
            onClick={() => void onSignOut()}
          >
            تسجيل الخروج
          </button>
        </div>
      ) : (
        <form className="mt-6 space-y-3" onSubmit={(e) => void onSubmit(e)}>
          <label className="block text-sm font-bold text-[#3a2a18]">
            البريد
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-[#efe2c4] bg-white/90 px-3 text-sm"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-bold text-[#3a2a18]">
            كلمة المرور
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-[#efe2c4] bg-white/90 px-3 text-sm"
              placeholder="6+ characters"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-[#3f9d6e] text-sm font-bold text-white disabled:opacity-60"
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            disabled={busy}
            className="h-11 w-full rounded-xl border border-[#efe2c4] bg-white/75 text-sm font-bold text-[#3a2a18] disabled:opacity-60"
            onClick={() => void run("signUp")}
          >
            إنشاء حساب
          </button>
        </form>
      )}

      {message && (
        <p className="mt-4 rounded-xl border border-[#efe2c4] bg-[#fbf3e1] px-3 py-2 text-sm text-[#3a2a18]">
          {message}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/diagnostics" className="text-[#7a4a26] underline">
          Diagnostics
        </Link>
        <Link to="/" className="text-[#7a4a26] underline">
          الرئيسية
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#efe2c4]/80 py-2 last:border-0">
      <span className="text-[#8a7355]">{label}</span>
      <span className="break-all text-left font-mono text-xs text-[#3a2a18]">{value}</span>
    </div>
  );
}
