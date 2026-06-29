import { supabase } from "@/integrations/supabase/client";

export type EmailSignUpOutcome =
  | { kind: "duplicate" }
  | { kind: "confirm_email"; email: string }
  | { kind: "ready_to_login"; email: string };

export async function registerWithEmail(params: {
  email: string;
  password: string;
  fullName: string;
}): Promise<EmailSignUpOutcome> {
  const trimmedEmail = params.email.trim();
  const fullName = params.fullName.trim();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password: params.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: { display_name: fullName, full_name: fullName },
    },
  });

  if (error) throw error;

  if (data.user?.identities?.length === 0) {
    return { kind: "duplicate" };
  }

  if (data.session) {
    await supabase.auth.signOut();
    return { kind: "ready_to_login", email: trimmedEmail };
  }

  return { kind: "confirm_email", email: trimmedEmail };
}

export function mapLoginError(message: string, context?: { afterRegistration?: boolean }): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    if (context?.afterRegistration) {
      return "يرجى تأكيد بريدك الإلكتروني أولًا — افتح رابط التأكيد في بريدك ثم سجّل الدخول مجددًا.";
    }
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (normalized.includes("email not confirmed")) {
    return "يرجى تأكيد بريدك الإلكتروني أولًا ثم المحاولة مجددًا.";
  }
  if (normalized.includes("user already registered")) {
    return "يوجد حساب مسجّل بالفعل بهذا البريد الإلكتروني.";
  }
  if (normalized.includes("password should be")) {
    return "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "محاولات كثيرة. يرجى الانتظار قليلًا ثم المحاولة مجددًا.";
  }
  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "تعذر الاتصال بالخدمة. تحقق من الإنترنت وحاول مرة أخرى.";
  }
  if (normalized.includes("provider") && normalized.includes("not enabled")) {
    return "تسجيل الدخول عبر Google أو Apple غير مفعّل بعد في إعدادات المشروع.";
  }
  if (normalized.includes("redirect") || normalized.includes("validation")) {
    return "رابط إعادة التوجيه غير مسجّل. أضف /auth/callback في Supabase Auth.";
  }

  return message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
}

export function mapSignUpError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Please sign in.";
  }
  if (normalized.includes("password should be")) {
    return "Password must be at least 6 characters.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait and try again.";
  }
  return message || "Unexpected error.";
}
