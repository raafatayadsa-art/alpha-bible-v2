## Goal

Make `BottomDock` actually leave the screen after 5s of inactivity (not just fade), and reliably re-appear on tap / scroll-up / touch, on every route.

## Root causes in current code (`src/components/bible/BottomDock.tsx`)

1. Hide state uses only `translate-y-[140%] opacity-0`. There is no `visibility: hidden`, so the nav still occupies the compositor layer and on some webviews remains faintly visible / interactive at the very bottom edge.
2. The `<nav>` always has `pointer-events-none` even when visible (only the inner child re-enables it). That's fragile, but more importantly nothing flips `visibility` when hidden.
3. Two `useEffect`s both arm the 5s timer (mount effect + pathname effect). Harmless, but the pathname effect runs on first mount too and can race with the mount listener registration.

## Fix (single file: `src/components/bible/BottomDock.tsx`)

1. Track visibility explicitly with the three states the user asked for:
   - **Visible:** `translateY(0)`, `visibility: visible`, `pointer-events: auto` on the inner dock.
   - **Hidden:** `translateY(100%)`, `visibility: hidden`, `pointer-events: none`.
   Apply `visibility: hidden` via inline style after the transform transition (use `transition: transform 400ms, visibility 0s 400ms` when hiding, and `visibility 0s 0s` when showing) so the slide-down animates, then the element is fully removed from hit-testing and painting.
2. Keep the existing 5s idle timer, but consolidate into one `useEffect`:
   - Arm timer on mount and on every interaction.
   - Listeners (all on `window`, passive where possible): `scroll`, `wheel`, `touchstart`, `pointerdown`, `click`, `keydown`.
   - `scroll` / `wheel` handler: if `scrollY` decreased OR is within 8px of top → reveal; otherwise just re-arm timer (do not hide early on scroll-down per spec — only the idle timer hides).
   - Any other interaction → reveal + re-arm timer.
3. On route change (`pathname`), reveal and re-arm the 5s timer (so a fresh screen always starts visible).
4. Remove the redundant always-on `pointer-events-none` on the `<nav>` wrapper; instead drive pointer-events from the hidden flag.
5. Keep the `hidden` prop as an external override (forces hidden regardless of idle state).

## Acceptance

- Open any screen → dock visible.
- Wait 5s with no input → dock slides down 100% and `visibility: hidden` (fully gone from hit-testing and paint).
- Tap anywhere, touch, or scroll up → dock slides back in within 400ms.
- Idle 5s again → hides again.
- Behavior identical on `/home`, `/profile`, `/bible`, `/books`, `/agpeya`, and all sub-routes (BottomDock is mounted per-screen, so the same logic applies).

## Out of scope

- No visual redesign of the dock.
- No changes to routes, icons, labels, or navigation behavior.
- No changes to the `hidden` prop API used by reader screens.