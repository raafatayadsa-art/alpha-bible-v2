import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { acceptAdminInvite, previewAdminInvite } from "@/features/platform-admin/admin-team/admin-team-api";
import { MC } from "@/features/platform-admin/platform-store";
import { refreshAuthContext } from "@/features/auth";

export function AlphaInviteAcceptScreen() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ email?: string; full_name?: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("رابط الدعوة غير صالح");
      return;
    }
    void previewAdminInvite(token).then((p) => {
      if (!p.ok) setError("الدعوة منتهية أو غير صالحة");
      else setPreview({ email: p.email, full_name: p.full_name });
      setLoading(false);
    });
  }, [token]);

  const submit = async () => {
    if (!preview?.email || !token) return;
    if (password.length < 8) {
      setError("كلمة المرور 8 أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: signErr } = await supabase.auth.signUp({
      email: preview.email,
      password,
      options: { data: { full_name: preview.full_name, username: preview.full_name } },
    });

    if (signErr) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: preview.email,
        password,
      });
      if (signInErr) {
        setSubmitting(false);
        setError(signErr.message);
        return;
      }
    }

    const accept = await acceptAdminInvite(token);
    if (!accept.ok) {
      setSubmitting(false);
      setError(accept.error ?? "تعذّر تفعيل الدعوة");
      return;
    }

    await refreshAuthContext();
    setSubmitting(false);
    void navigate({ to: "/platform", replace: true });
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: MC.bg, color: MC.text }}
    >
      <div
        className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border"
        style={{ borderColor: `${MC.green}44`, background: `${MC.green}14` }}
      >
        <Shield className="h-7 w-7" style={{ color: MC.green }} />
      </div>
      <h1 className="text-[16px] font-extrabold text-white">دعوة فريق Alpha</h1>
      {loading ? (
        <Loader2 className="mt-6 h-8 w-8 animate-spin" style={{ color: MC.green }} />
      ) : preview ? (
        <>
          <p className="mt-2 text-center text-[11px] font-bold text-slate-400">
            مرحباً {preview.full_name} — حدّد كلمة المرور لتفعيل حسابك
          </p>
          <p className="mt-1 text-[10px] font-bold text-slate-500">{preview.email}</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="mt-5 w-full max-w-xs rounded-xl border px-4 py-3 text-[12px] text-white outline-none"
            style={{ borderColor: MC.panelBorder, background: MC.panel }}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="تأكيد كلمة المرور"
            className="mt-2 w-full max-w-xs rounded-xl border px-4 py-3 text-[12px] text-white outline-none"
            style={{ borderColor: MC.panelBorder, background: MC.panel }}
          />
          {error ? <p className="mt-3 text-[10px] font-bold text-red-400">{error}</p> : null}
          <button
            type="button"
            disabled={submitting}
            onClick={() => void submit()}
            className="mt-4 rounded-full px-8 py-2.5 text-[12px] font-extrabold text-black disabled:opacity-50"
            style={{ background: MC.green }}
          >
            {submitting ? "جاري التفعيل…" : "تفعيل الحساب"}
          </button>
        </>
      ) : (
        <p className="mt-4 text-[11px] font-bold text-red-400">{error ?? "رابط غير صالح"}</p>
      )}
    </div>
  );
}
