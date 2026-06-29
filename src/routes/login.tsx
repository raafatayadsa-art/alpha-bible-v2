import { createFileRoute } from "@tanstack/react-router";
import { AlphaLoginScreen } from "@/components/auth/AlphaAuthScreens";

type LoginSearch = {
  registered?: "1" | "confirm";
  oauth?: "failed";
  oauthError?: string;
  email?: string;
  redirect?: string;
};

function sanitizeLoginRedirect(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
  if (raw.startsWith("/login") || raw.startsWith("/register")) return undefined;
  return raw.slice(0, 120);
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    registered:
      search.registered === "1" || search.registered === "confirm"
        ? (search.registered as "1" | "confirm")
        : undefined,
    oauth: search.oauth === "failed" ? "failed" : undefined,
    oauthError: typeof search.oauthError === "string" ? search.oauthError.slice(0, 120) : undefined,
    email: typeof search.email === "string" ? search.email.slice(0, 255) : undefined,
    redirect: sanitizeLoginRedirect(search.redirect),
  }),
  head: () => ({ meta: [
    { title: "تسجيل الدخول — Alpha" },
    { name: "description", content: "سجّل دخولك إلى تطبيق ألفا لمتابعة رحلتك الروحية." },
    { property: "og:title", content: "تسجيل الدخول — Alpha" },
    { property: "og:description", content: "سجّل دخولك إلى تطبيق ألفا لمتابعة رحلتك الروحية." },
  ] }),
  component: AlphaLoginScreen,
});