# Alpha Connect — Secure Theme Mic Button Restore

**Date:** 2026-06-17  
**Scope:** Restore original dark (Secure) mic styling; keep Classic icon-accent styling unchanged.

---

## Executive Summary

The mic button in **Alpha Connect Secure** (dark theme) was inadvertently styled with Classic-only icon-accent rules (neutral glass face + forest green icon). Those global rules were removed and mic UI was split by theme: Secure uses the original neon green icon, `--gradient-mic` face, and `connect-mic-transmitting` glow; Classic keeps the approved white card + dark green icon + pressed fill.

---

## Findings

1. **Root cause:** CSS rules under `.alpha-connect-theme .connect-ptt-icon-accent` applied to both themes, overriding Secure mic appearance.
2. **VoiceControl (channel PTT):** Now branches on `isClassicConnectTheme(getConnectTheme(settings))` — Classic uses `connect-ptt-icon-accent`; Secure uses `neon-ring`, `text-neon-green`, and oklch decorative rings.
3. **VoiceMessageRecorder:** Passes `iconAccent={isClassicMic}` to `ConnectCircleButton` instead of always `true`.
4. **ConnectCircleButton:** When `iconAccent={false}` on green tone, restores `text-neon-green`, neon drop-shadow, `neon-ring`, and `connect-mic-transmitting` on press.
5. **styles.css:** Icon-accent block scoped to `.alpha-connect-theme--classic` only; duplicate global block removed.

---

## Warnings

- Theme switch while on mic screen requires re-render via existing settings load; no new listener added (same as other theme-dependent UI).
- `call.tsx` / `personal-call.tsx` mic buttons were not in scope unless they share the same classes.

---

## Errors

None. `npm run build` completed successfully.

---

## Recommendations

1. Manually verify Secure theme: channel PTT + voice message recorder show neon green on dark gradient.
2. Manually verify Classic theme: white mic face, dark green icon, full green fill on press.
3. Optional: subscribe VoiceControl to `CONNECT_THEME_CHANGED_EVENT` for instant theme swap without navigation.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `src/routes/alpha-connect.tsx` | Theme-conditional mic in VoiceControl + VoiceMessageRecorder |
| `src/components/alpha/ConnectCircleButton.tsx` | Secure vs Classic icon/press styling |
| `src/components/alpha/styles.css` | Icon-accent CSS limited to `--classic` |
