import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type OAuthProvider = "google" | "apple";

export function getAuthCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

export async function signInWithOAuthProvider(provider: OAuthProvider): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthCallbackUrl(),
      skipBrowserRedirect: false,
      ...(provider === "apple" ? { scopes: "name email" } : {}),
    },
  });

  if (error) throw error;

  // Some environments return a URL instead of auto-redirecting.
  if (data?.url && typeof window !== "undefined") {
    window.location.assign(data.url);
  }
}

function readOAuthErrorFromUrl(): string | null {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const queryParams = new URLSearchParams(window.location.search);
  return (
    hashParams.get("error_description") ||
    hashParams.get("error") ||
    queryParams.get("error_description") ||
    queryParams.get("error")
  );
}

/** Exchange PKCE code (or hash tokens) after OAuth redirect — required for SPA callback routes. */
export async function completeOAuthCallback(): Promise<{
  session: Session | null;
  error: Error | null;
}> {
  const oauthError = readOAuthErrorFromUrl();
  if (oauthError) {
    return { session: null, error: new Error(oauthError) };
  }

  const code = new URLSearchParams(window.location.search).get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { session: null, error };
    return { session: data.session, error: null };
  }

  // Implicit / detectSessionInUrl fallback — brief poll while client parses hash.
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { session: null, error };
    if (data.session) return { session: data.session, error: null };
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  return { session: null, error: new Error("Missing OAuth session") };
}
