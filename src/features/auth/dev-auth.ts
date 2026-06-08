import { supabase } from "@/integrations/supabase/client";
import { refreshAuthContext } from "./auth-context";

export type DevAuthResult =
  | { ok: true; userId: string; email: string | null }
  | { ok: false; message: string };

function mapAuthError(error: { message: string }): DevAuthResult {
  return { ok: false, message: error.message };
}

/** Dev-only — email/password sign-up against Supabase Auth. */
export async function devSignUp(email: string, password: string): Promise<DevAuthResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    return { ok: false, message: "أدخل البريد وكلمة المرور" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
  });

  if (error) return mapAuthError(error);

  if (data.session?.user?.id) {
    await refreshAuthContext();
    return {
      ok: true,
      userId: data.session.user.id,
      email: data.session.user.email ?? trimmedEmail,
    };
  }

  if (data.user?.identities?.length === 0) {
    return { ok: false, message: "هذا البريد مسجّل مسبقاً — استخدم تسجيل الدخول" };
  }

  if (data.user?.id) {
    const signIn = await devSignIn(trimmedEmail, password);
    if (signIn.ok) return signIn;
    return {
      ok: false,
      message: "تم إنشاء الحساب — فعّل البريد أو سجّل الدخول يدوياً",
    };
  }

  return { ok: false, message: "تعذّر إنشاء الحساب" };
}

/** Dev-only — email/password sign-in. */
export async function devSignIn(email: string, password: string): Promise<DevAuthResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    return { ok: false, message: "أدخل البريد وكلمة المرور" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) return mapAuthError(error);
  if (!data.user?.id) return { ok: false, message: "لا توجد جلسة بعد تسجيل الدخول" };

  await refreshAuthContext();
  return {
    ok: true,
    userId: data.user.id,
    email: data.user.email ?? trimmedEmail,
  };
}

/** Dev-only — end Supabase session. */
export async function devSignOut(): Promise<void> {
  await supabase.auth.signOut();
  await refreshAuthContext();
}
