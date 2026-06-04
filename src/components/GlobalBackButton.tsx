import { useRouter, useRouterState } from "@tanstack/react-router";

/**
 * Unified Back navigation button for sub-screens that don't
 * already include a back control in their own header.
 *
 * - Fixed at the top of the screen (RTL: right edge of centered frame)
 * - Respects iPhone safe area
 * - Hidden on main bottom-nav screens and screens that already
 *   render an in-header BackButton.
 * - Uses history.back() so scroll position / state of the
 *   previous screen is preserved by the browser.
 */
// All current sub-screens already render their own in-header BackButton.
// Root content screens (Home, Synaxarium Home, Feasts Home, Agpeya Home,
// Katamaros Home, Bible Home) must keep their Notifications/Search actions
// and NEVER show a Back button — so the global auto-mount is disabled.
const SHOW_ON_PREFIXES: string[] = [];

const HIDE_ON_EXACT = new Set<string>([
  "/",
  "/home",
  "/agpeya",
  "/bible",
  "/synaxarium",
  "/feasts",
  "/onboarding",
  "/diagnostics",
]);

// Routes that already render their own BackButton in-header:
const SKIP_PREFIXES = [
  "/feasts/",
  "/synaxarium/",
  "/agpeya/",
  "/books",
];

export function GlobalBackButton() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (HIDE_ON_EXACT.has(pathname)) return null;
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p) && pathname !== p.slice(0, -1))) {
    return null;
  }
  const matches = SHOW_ON_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  // Only auto-mount on the explicitly listed entry sub-screens; other
  // sub-screens already include an in-header BackButton.
  const isExactEntry =
    SHOW_ON_PREFIXES.includes(pathname) ||
    SHOW_ON_PREFIXES.some((p) => pathname === p + "/");
  if (!matches || !isExactEntry) return null;

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/home" });
    }
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center"
      style={{ paddingTop: "max(env(safe-area-inset-top), 14px)" }}
      dir="rtl"
    >
      <div className="pointer-events-none relative mx-auto w-full max-w-[430px] px-4">
        <button
          type="button"
          aria-label="رجوع"
          onClick={goBack}
          className="pointer-events-auto absolute right-4 top-0 inline-grid h-9 w-9 place-items-center rounded-full border border-[#efe2c4] bg-white/75 text-[#3a2a18] backdrop-blur-xl shadow-[0_8px_18px_-10px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-90 transition-transform"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M7 4l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
